import { firestore } from "@/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProblem } from "@/types/problem";
import getDefaultIsLocked from "./getDefaultIsLocked";

export default async function createUserProblem(
  userId: string,
  pid: string
): Promise<UserProblem | null> {
  if (!firestore || !userId || !pid) return null;

  const userProblemRef = doc(firestore, "users", userId, "problems", pid);

  // 檢查文件是否已經存在
  const userProblemDoc = await getDoc(userProblemRef);
  if (userProblemDoc.exists()) {
    // 如果文件已經存在，直接返回文件的資料
    return userProblemDoc.data() as UserProblem;
  }
  // 如果文件不存在，創建新問題
  const newUserProblem: UserProblem = {
    id: pid,
    threadId: "",
    is_solved: false,
    isLocked: await getDefaultIsLocked(pid),
    remainTimes: 20,
    acceptedTime: 0,
  };
  await setDoc(userProblemRef, newUserProblem);

  return newUserProblem;
}
