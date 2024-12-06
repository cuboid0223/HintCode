// import { NextResponse } from "next/server";
// import * as jose from "jose";

// export async function POST(request: Request) {
//   const body = await request.json();
//   const { userId, role } = body;

//   if (!userId) {
//     return NextResponse.json(
//       { message: "userId is required" },
//       { status: 400 }
//     );
//   }
//   try {
//     // 生成 JWT token
//     const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
//     const token = await new jose.SignJWT({ userId, role })
//       .setProtectedHeader({ alg: "HS256" })
//       .setExpirationTime("7d")
//       .sign(secret);
//     // 回應 token 給前端
//     return NextResponse.json({ token });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Token generation failed" },
//       { status: 500 }
//     );
//   }
// }
