export const serverConfig = {
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  useSecureCookies: process.env.USE_SECURE_COOKIES === "true",
  cookieName: "AuthToken",
  cookieSignatureKeys: ["Key-Should-Be-at-least-32-bytes-in-length"],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.USE_SECURE_COOKIES === "true", // Set this to true on HTTPS environments
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24, // 12天
  },
  serviceAccount: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
  },
};

export const clientConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const authConfig = {
  apiKey: serverConfig.firebaseApiKey,
  cookieName: "AuthToken",
  cookieSignatureKeys: serverConfig.cookieSignatureKeys,
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: serverConfig.useSecureCookies, // Set this to true on HTTPS environments
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24, // twelve days
  },
  serviceAccount: serverConfig.serviceAccount,
  // Set to false in Firebase Hosting environment due to https://stackoverflow.com/questions/44929653/firebase-cloud-function-wont-store-cookie-named-other-than-session
  enableMultipleCookies: true,
  // Set to false if you're not planning to use `signInWithCustomToken` Firebase Client SDK method
  enableCustomToken: true,
  experimental_enableTokenRefreshOnExpiredKidHeader: true,
  debug: true,
  // tenantId: clientConfig.tenantId,
};
