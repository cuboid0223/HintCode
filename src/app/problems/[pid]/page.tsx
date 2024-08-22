import { firestore } from "@/firebase/firebase";
import ProblemPage from "./problemPage";
import { doc, getDoc } from "firebase/firestore";
import getUserProblemById from "@/utils/problems/getUserProblemById";
import { redirect } from "next/navigation";
import { Problem, UserProblem } from "@/types/problem";

export default async function Page({ params, searchParams }) {
  const { pid } = params;
  const userId = searchParams.userId;

  if (!userId) {
    return <div>請先登入</div>;
  }

  let userProblem: UserProblem;

  try {
    userProblem = await getUserProblemById(userId, pid);
  } catch (error) {
    return <div>{`在使用者資料庫未找到 ${pid}`}</div>;
  }

  // 檢查該問題是否被鎖起來
  if (userProblem.isLocked) {
    // 如果問題被鎖起來，則伺服器端重定向用戶到鎖定通知頁面
    // 避免使用者透過修改網址進入鎖定的題目
    redirect(`/locked?pid=${pid}`);
  }

  const problemRef = doc(firestore, "problems", pid);
  const problemSnap = await getDoc(problemRef);
  if (!problemSnap.exists()) {
    return <div>{`在題目資料庫未找到 ${pid}`}</div>;
  }
  const problemData = problemSnap.data() as Problem;

  return <ProblemPage problem={problemData} />;
}
