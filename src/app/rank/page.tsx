// Import your Client Component

import PersonalInfo from "@/components/PersonalInfo";
import RankingList from "@/components/RankingList";
import Topbar from "@/components/Topbar/Topbar";

export default async function Page() {
  return (
    <>
      <Topbar />
      <PersonalInfo />
      <RankingList />
    </>
  );
}
