import { headers } from "next/headers";
import { User } from "@/types/global";
import HomePage from "./homePage";
import MaintainedPage from "@/components/Maintained";
import { getMaintenanceSettings } from "@/utils/problems/getSettings";
import fetchUserById from "@/utils/fetchUserById";
import { SUPER_USER } from "@/utils/const";

export default async function Page() {
  const userInfo = await getUserInfo();

  if (await shouldShowMaintainedPage(userInfo)) {
    return <MaintainedPage />;
  }
  return <HomePage />;
}

async function getUserInfo(): Promise<User | null> {
  const headersList = headers();
  const userInfoHeader = headersList.get("x-user-info");
  if (!userInfoHeader) return null;

  try {
    const { userId } = JSON.parse(userInfoHeader || "{}");
    return userId ? await fetchUserById(userId) : null;
  } catch (error) {
    console.error("Error parsing user info header:", error);
    return null;
  }
}

async function shouldShowMaintainedPage(
  userInfo: User | null
): Promise<boolean> {
  if (!userInfo) return true;

  const isMaintained = await getMaintenanceSettings();
  return userInfo.role !== SUPER_USER && isMaintained;
}
