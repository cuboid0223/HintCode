import RankingList from "@/components/RankingList";
import Topbar from "@/components/Topbar";
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
