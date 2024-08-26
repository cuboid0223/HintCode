import { firestore } from "@/firebase/firebase";
import ProblemPage from "./problemPage";
import { doc, getDoc } from "firebase/firestore";
import { Problem } from "@/types/problem";

export default async function Page({ params, searchParams }) {
  const { pid } = params;
  const userId: string = searchParams.userId;

  if (!userId) {
    return <div>請先登入</div>;
  }

  // 取得該問題的詳細資料
  const problemRef = doc(firestore, "problems", pid);
  const problemSnap = await getDoc(problemRef);
  if (!problemSnap.exists()) {
    return <div>{`在題目資料庫未找到 ${pid}`}</div>;
  }
  const problemData = problemSnap.data() as Problem;

  return <ProblemPage problem={problemData} />;
}
