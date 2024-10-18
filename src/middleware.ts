import { NextRequest, NextResponse } from "next/server";
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin,
} from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "@/config";

const PUBLIC_PATHS = ["/register", "/login", "/forget-password"];

export async function middleware(request: NextRequest) {
  // 瀏覽器發送到 Sentry 的請求通過 Next.js 的「重寫（rewrite）」功能路由到 /monitoring，來繞過一些會攔截 Sentry 請求的廣告攔截器（ad-blockers）。
  // 確保 /monitoring 路由不會與 Next.js 中的 middleware 發生衝突
  // 或是關掉 adblock
  if (request.nextUrl.pathname.startsWith("/monitoring")) {
    return NextResponse.next();
  }
  return authMiddleware(request, {
    loginPath: "/api/login", // 這個 /api/login 並非自己建立的 api route ，是 next-firebase-auth-edge 設置的常數
    logoutPath: "/api/logout", // 這個 /api/logout 並非自己建立的 api route ，是 next-firebase-auth-edge 設置的常數
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }

      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleInvalidToken: async (reason) => {
      console.info("Missing or malformed credentials", { reason });

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      });
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error });

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      });
    },
  });
}

export const config = {
  matcher: ["/", "/((?!_next|api|.*\\.).*)", "/api/login", "/api/logout"],
};
