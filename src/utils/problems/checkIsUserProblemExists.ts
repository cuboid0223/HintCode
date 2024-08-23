import { firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

async function checkIsUserProblemExists(userId: string, problemId: string) {
  if (!userId || !problemId) {
    throw new Error("Invalid userId or problemId");
  }

  // 獲取文件參考
  const userProblemDocRef = doc(
    firestore,
    "users",
    userId,
    "problems",
    problemId
  );

  // 獲取文件快照
  const docSnap = await getDoc(userProblemDocRef);

  // 確認文件是否存在
  if (docSnap.exists()) {
    // console.log("Document exists:", docSnap.data());
    // setThreadId(docSnap.data().threadId);
    return true;
  } else {
    console.log("Document does not exist");
    return false;
  }
}

export default checkIsUserProblemExists;
