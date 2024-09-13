import { firestore } from "@/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { UserProblem } from "@/types/problem";
import getDefaultIsLocked from "./getDefaultIsLocked";

export default async function createUserProblem(
  userId: string,
  pid: string
): Promise<UserProblem> {
  if (!firestore || !userId || !pid) return;
  const newUserProblem: UserProblem = {
    id: pid,
    threadId: "",
    is_solved: false,
    isLocked: await getDefaultIsLocked(pid),
    remainTimes: 20,
    acceptedTime: 0,
  };

  const userProblemRef = doc(firestore, "users", userId, "problems", pid);
  await setDoc(userProblemRef, newUserProblem);

  return newUserProblem;
}
