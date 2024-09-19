import { Redis } from '@upstash/redis'
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./firebase/firebase";
import { jwtVerify } from "jose";

// 創建 Redis 客戶端
const redis = new Redis({
  url: 'https://quiet-basilisk-20437.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

interface MaintenanceSettings {
  isMaintained: boolean;
  lastUpdated?: string;
  maintenanceMessage?: string;
}

const CACHE_KEY = 'maintenance_settings';
const CACHE_DURATION = 300; // 5分鐘，以秒為單位

async function getMaintenanceSettings(): Promise<MaintenanceSettings | null> {
  // 嘗試從 Redis 獲取緩存數據
  const cachedSettings = await redis.get(CACHE_KEY);
  
  if (cachedSettings && typeof cachedSettings === 'string') {
    return JSON.parse(cachedSettings);
  }

  // 如果緩存中沒有，從 Firestore 獲取
  const settingsRef = doc(firestore, "settings", "data");
  const settingsSnap = await getDoc(settingsRef);
  
  if (settingsSnap.exists()) {
    const settings = settingsSnap.data() as MaintenanceSettings;
    // 將數據存入 Redis
    await redis.set(CACHE_KEY, JSON.stringify(settings), { ex: CACHE_DURATION });
    return settings;
  }

  return null;
}

async function verifyToken(token: string | undefined) {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET); // 使用 JWT_SECRET
    const { payload } = await jwtVerify(token, secret); // 驗證 JWT
    return payload; // 返回解碼後的 payload
  } catch (err) {
    console.error("Invalid or expired JWT", err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const decodedToken = await verifyToken(token); // 使用 await 調用 verifyToken
  console.log("decodedToken: ", decodedToken);
  // 如果沒有 token 或驗證失敗，重導向至 /auth
  if (!decodedToken || !token) {
    console.log("Invalid or missing token, redirecting to auth.");
    return redirectToAuth(request);
  }

  // 檢查是否為 superuser，如果是則直接放行
  if (decodedToken.role === "superuser") {
    console.log("Superuser detected, bypassing maintenance check.");
    return NextResponse.next();
  }
  console.log("User role detected:", decodedToken.role);

  const settings = await getMaintenanceSettings();

  // 如果無法取得設定資料，繼續正常處理
  if (!settings) {
    console.log("No settings found, proceeding without maintenance checks.");
    return NextResponse.next();
  }

  const { isMaintained } = settings;
  console.log("Maintenance status:", isMaintained);
  const pathname = request.nextUrl.pathname;

  // 根據維護狀態決定是否重導向至 /maintained 或 /auth
  return handleMaintenanceRedirect(isMaintained, pathname, request);
}

// 封裝重導向到 /auth 的邏輯
function redirectToAuth(request: NextRequest) {
  return NextResponse.redirect(new URL("/auth", request.url));
}

// 封裝處理維護狀態重導向的邏輯
function handleMaintenanceRedirect(
  isMaintained: boolean,
  pathname: string,
  request: NextRequest
) {
  console.log("isMaintained:", isMaintained, "pathname:", pathname);
  if (isMaintained && pathname !== "/maintained") {
    console.log("Redirecting to /maintained page.");
    return NextResponse.redirect(new URL("/maintained", request.url));
  }

  if (!isMaintained && pathname === "/maintained") {
    console.log("Redirecting to /auth page.");
    return redirectToAuth(request);
  }
  console.log("Proceeding without redirection.");
  return NextResponse.next();
}

// 設置 matcher 來決定 Middleware 應該在哪些路徑上運行
export const config = {
  matcher: ["/", "/problems/:path*"],
};
