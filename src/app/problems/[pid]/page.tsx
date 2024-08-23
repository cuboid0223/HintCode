import { firestore } from "@/firebase/firebase";
import ProblemPage from "./problemPage";
import { doc, getDoc } from "firebase/firestore";
import getUserProblemById from "@/utils/problems/getUserProblemById";
import { redirect } from "next/navigation";
import { Problem, UserProblem } from "@/types/problem";

export default async function Page({ params, searchParams }) {
  const { pid } = params;
  const userId: string = searchParams.userId;

  if (!userId) {
    return <div>請先登入</div>;
  }

  // let userProblem: UserProblem;
  // try {
  //   // 檢查使用者的問題是否存在
  //   userProblem = await getUserProblemById(userId, pid);
  // } catch (error) {
  //   return <div>{`在使用者資料庫未找到 ${pid}`}</div>;
  // }

  // if (userProblem?.isLocked) {
  //   // 如果問題被鎖起來，則伺服器端重定向用戶到鎖定通知頁面
  //   redirect(`/locked?pid=${pid}`);
  // }

  // 取得該問題的詳細資料
  const problemRef = doc(firestore, "problems", pid);
  const problemSnap = await getDoc(problemRef);
  if (!problemSnap.exists()) {
    return <div>{`在題目資料庫未找到 ${pid}`}</div>;
  }
  const problemData = problemSnap.data() as Problem;

  return <ProblemPage problem={problemData} />;
}
