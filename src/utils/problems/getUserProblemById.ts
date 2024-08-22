import { firestore } from "@/firebase/firebase";
import { UserProblem } from "@/types/problem";
import { doc, getDoc } from "firebase/firestore";

const getUserProblemById = async (uid: string, problemId: string) => {
  try {
    const userProblemRef = doc(firestore, "users", uid, "problems", problemId);
    const userProblemSnapshot = await getDoc(userProblemRef);
    if (userProblemSnapshot.exists()) {
      // 文檔存在時返回其數據
      return userProblemSnapshot.data() as UserProblem;
    } else {
      console.log("Problem not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching problem by ID:", error);
  }
};

export default getUserProblemById;
