import { firestore } from "@/firebase/firebase";
import { Problem } from "@/utils/types/problem";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

function useGetProblems(
  setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const getProblems = async () => {
      // fetching data logic
      setLoadingProblems(true);
      const q = query(
        collection(firestore, "problems"),
        orderBy("order", "desc")
      );
      const querySnapshot = await getDocs(q);
      const tmp: Problem[] = [];
      querySnapshot.forEach((doc) => {
        tmp.push({ id: doc.id, ...doc.data() } as Problem);
      });
      console.log("problems from Firestore", tmp);
      setProblems(tmp);
      setLoadingProblems(false);
    };

    getProblems();
  }, [setLoadingProblems]);
  return problems;
}

export default useGetProblems;
