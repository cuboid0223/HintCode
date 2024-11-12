import { BehaviorsState } from "@/atoms/behaviorsAtom";
import { firestore } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

async function updateProblemLockStatus(
  uid: string,
  problemId: string,
  isLocked: boolean
) {
  if (!uid || !problemId) return;
  try {
    const userProblemRef = doc(firestore, "users", uid, "problems", problemId);
    await updateDoc(userProblemRef, {
      isLocked: isLocked,
    });
  } catch (error) {
    console.error("Error updating isLocked status: ", error);
  }
}

async function updateProblemRemainTimes(uid: string, problemId: string) {
  try {
    const userProblemRef = doc(firestore, "users", uid, "problems", problemId);

    const problem = await getDoc(userProblemRef);

    if (problem.data().remainTimes > 0) {
      await updateDoc(userProblemRef, {
        remainTimes: problem.data().remainTimes - 1,
      });
    }
  } catch (error) {
    console.error("Error updating remain times: ", error);
  }
}

async function updateProblemBehaviors(
  uid: string,
  problemId: string,
  newBehaviors: BehaviorsState
) {
  try {
    const userProblemRef = doc(firestore, "users", uid, "problems", problemId);
    const problem = await getDoc(userProblemRef);
    await updateDoc(userProblemRef, {
      behaviors: [...problem.data().behaviors, ...newBehaviors],
    });
  } catch (error) {
    console.error("Error updating remain times: ", error);
  }
}

export {
  updateProblemRemainTimes,
  updateProblemLockStatus,
  updateProblemBehaviors,
};
