import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    cookieName: "token",
    cookieSignatureKeys: ["Key-Should-Be-at-least-32-bytes-in-length"],
    serviceAccount: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    },
  });

  if (!tokens) {
    throw new Error("Unauthenticated");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = new NextResponse(
    JSON.stringify({
      tokens,
    }),
    {
      status: 200,
      headers,
    }
  );

  return response;
}
