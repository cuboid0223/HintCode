// Import your Client Component

import PersonalInfo from "@/components/PersonalInfo";
import RankingList from "@/components/RankingList";
import Topbar from "@/components/Topbar/Topbar";
import { SceneLayout } from "@/components/dom/SceneLayout";

export default async function Page() {
  return (
    <>
      <SceneLayout>
        <Topbar />
        <RankingList />
      </SceneLayout>
    </>
  );
}
