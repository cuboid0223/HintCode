import { firestore } from "@/firebase/firebase";
import chunkArray from "@/utils/chunkArray";
import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";

function useGetProblemGroup() {
  const [problemGroup, setProblemGroup] = useState([]);

  useEffect(() => {
    const getProblemGroup = async () => {
      const q = query(collection(firestore, "problemGroups"));
      const querySnapshot = await getDocs(q);
      const tmp = [];
      querySnapshot.forEach((doc) => {
        tmp.push({ id: doc.id, ...doc.data() });
      });
      // console.log("problems from Firestore", tmp);
      const ids: string[] = tmp[0]?.matrix.map((item) => item.id);
      const chunkedArr = chunkArray(ids, 2);
      setProblemGroup(chunkedArr);
    };

    getProblemGroup();
  }, []);
  return { problemGroup };
}

export default useGetProblemGroup;