import { User } from "@/types/global";
import HomePage from "./homePage";
import MaintainedPage from "@/components/Maintained";
import { cookies } from "next/headers";
import getSystemSettings from "@/utils/problems/getSystemSettings";
import fetchUserById from "@/utils/fetchUserById";
import { getTokens } from "next-firebase-auth-edge";
import { SUPER_USER } from "@/utils/const";
import { notFound } from "next/navigation";
import { clientConfig, serverConfig } from "@/config";

export default async function Page() {
  const tokens = await getTokens(cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  const userInfo = await fetchUserById(tokens.decodedToken.uid);

  if (!tokens) notFound();

  if (await shouldShowMaintainedPage(userInfo)) return <MaintainedPage />;

  return <HomePage />;
}

async function shouldShowMaintainedPage(
  userInfo: User | null
): Promise<boolean> {
  if (!userInfo) return true;

  const system = await getSystemSettings();
  // 方便 superuser 維修
  return userInfo.role !== SUPER_USER && system.isMaintained;
}
