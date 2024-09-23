import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

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

  return NextResponse.next();
}

// 封裝重導向到 /auth 的邏輯
function redirectToAuth(request: NextRequest) {
  return NextResponse.redirect(new URL("/auth", request.url));
}

// 設置 matcher 來決定 Middleware 應該在哪些路徑上運行
export const config = {
  matcher: ["/", "/problems/:path*"],
};
