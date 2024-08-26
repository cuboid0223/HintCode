import { firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const getDefaultIsLocked = async (problemId: string) => {
  const problemRef = doc(firestore, "problems", problemId);
  const docSnap = await getDoc(problemRef);

  if (docSnap.exists()) {
    return docSnap.data().isLocked;
  } else return true;
};

export default getDefaultIsLocked;
