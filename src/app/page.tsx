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
  const { userId } = JSON.parse(headersList.get("x-user-info") || "{}");
  return userId ? await fetchUserById(userId) : null;
}

async function shouldShowMaintainedPage(
  userInfo: User | null
): Promise<boolean> {
  if (!userInfo) return false;

  const isMaintained = await getMaintenanceSettings();
  console.log("isMaintained : ", isMaintained);
  console.log("userInfo.role !== SUPER_USER : ", userInfo.role !== SUPER_USER);
  console.log(userInfo.role !== SUPER_USER && isMaintained);
  return userInfo.role !== SUPER_USER && isMaintained;
}
