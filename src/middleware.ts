import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(token: string | undefined) {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET); // Use JWT_SECRET instead of NEXT_PUBLIC
    const { payload } = await jwtVerify(token, secret); // Verify JWT
    return payload; // Return the decoded payload
  } catch (err) {
    console.error("Invalid or expired JWT", err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const decodedToken = await verifyToken(token);

  if (!decodedToken) {
    // If the token is missing or invalid, redirect to /auth
    return redirectToAuth(request, "Token-is-invalid-or-expired");
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-info", JSON.stringify(decodedToken));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Custom redirect function with an optional message
function redirectToAuth(request: NextRequest, message?: string) {
  console.log("送你回來");
  const authUrl = new URL("/auth", request.url);
  if (message) {
    authUrl.searchParams.set("message", message); // Pass an optional error message
  }
  return NextResponse.redirect(authUrl);
}

// Configure paths where the middleware should run
export const config = {
  matcher: ["/", "/problems/:path*"],
};
