"use server";

import { signInWithEmailAndPassword } from "firebase/auth";
import { refreshCookiesWithIdToken } from "next-firebase-auth-edge/lib/next/cookies";
import { cookies, headers } from "next/headers";
// import { authConfig } from "../../config/server-config";
import { redirect } from "next/navigation";
import { auth } from "@/firebase/firebase";
import { authConfig } from "@/config";

export async function loginAction(username: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, username, password);

  const idToken = await credential.user.getIdToken();
  await refreshCookiesWithIdToken(
    idToken,
    await headers(),
    await cookies(),
    authConfig
  );
  redirect("/");
}
