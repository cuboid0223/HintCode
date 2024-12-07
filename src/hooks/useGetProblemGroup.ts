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
      const ids: string[] = tmp[0]?.matrix.map((item) => item.id);
      // [1,2,3,4,5,6]
      //[[1,2],[3,4],[5,6]]
      const problemGroupsMatrix = chunkArray(ids, 2);
      setProblemGroup(problemGroupsMatrix);
    };

    getProblemGroup();
  }, []);
  return { problemGroup };
}

export default useGetProblemGroup;
