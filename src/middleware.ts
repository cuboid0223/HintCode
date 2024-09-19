import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./firebase/firebase";
import { jwtVerify } from "jose"; // 使用 jose 來驗證 JWT

// Firestore 設定讀取函數
async function getMaintenanceSettings() {
  const settingsRef = doc(firestore, "settings", "data");
  const settingsSnap = await getDoc(settingsRef);

  if (!settingsSnap.exists()) {
    console.error("No such document in Firestore!");
    return null;
  }

  return settingsSnap.data();
}

// 使用 jose 驗證 JWT 的函數
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

// Middleware 主邏輯
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const decodedToken = await verifyToken(token); // 使用 await 調用 verifyToken
  console.log(decodedToken);
  // 如果沒有 token 或驗證失敗，重導向至 /auth
  if (!decodedToken) {
    return redirectToAuth(request);
  }

  // 檢查是否為 superuser，如果是則直接放行
  if (decodedToken.role === "superuser") {
    return NextResponse.next();
  }

  const settings = await getMaintenanceSettings();

  // 如果無法取得設定資料，繼續正常處理
  if (!settings) {
    return NextResponse.next();
  }

  const { isMaintained } = settings;
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
  if (isMaintained && pathname !== "/maintained") {
    return NextResponse.redirect(new URL("/maintained", request.url));
  }

  if (!isMaintained && pathname === "/maintained") {
    return redirectToAuth(request);
  }

  return NextResponse.next();
}

// 設置 matcher 來決定 Middleware 應該在哪些路徑上運行
export const config = {
  matcher: ["/", "/problems/:path*"],
};
