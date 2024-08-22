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
    return <div>{`${pid} 未找到`}</div>;
  }

  // 檢查該問題是否被鎖定
  if (userProblem.isLocked) {
    // 如果問題被鎖定，則伺服器端重定向用戶到鎖定通知頁面
    redirect("/locked");
  }

  const problemRef = doc(firestore, "problems", pid);
  const problemSnap = await getDoc(problemRef);
  if (!problemSnap.exists()) {
    return <div>Problem not found!</div>;
  }
  const problemData = problemSnap.data() as Problem;

  return <ProblemPage problem={problemData} />;
}

// export async function getServerSideProps(context) {
//   const { userId } = context.query;
//   const { id } = context.params;

//   // 模擬從 API 或資料庫取得問題的資料
//   const userProblem = await getUserProblemById(userId, id);
//   console.log(userProblem);
//   // 如果問題被鎖定，將使用者重定向到其他頁面
//   if (userProblem.isLocked) {
//     return {
//       redirect: {
//         destination: "/locked", // 你可以重定向到一個鎖定的通知頁面
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {
//       userProblem,
//     },
//   };
// }
