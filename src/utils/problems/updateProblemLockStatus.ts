import { firestore } from "@/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

async function updateProblemLockStatus(
  uid: string,
  problemId: string,
  isLocked: boolean
) {
  try {
    const userProblemRef = doc(firestore, "users", uid, "problems", problemId);
    await updateDoc(userProblemRef, {
      isLocked: isLocked,
    });
    console.log("isLocked status updated successfully!");
  } catch (error) {
    console.error("Error updating isLocked status: ", error);
  }
}

export default updateProblemLockStatus;
