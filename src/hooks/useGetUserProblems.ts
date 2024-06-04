import { auth, firestore } from "@/firebase/firebase";
import { UserProblem } from "@/utils/types/problem";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

function useGetUserProblems() {
  const [userProblems, setUserProblems] = useState<UserProblem[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const getUserProblems = async () => {
      const userProblemRef = collection(
        firestore,
        "users",
        user!.uid,
        "problems"
      );
      let temp = [];
      const userProblemSnapshot = await getDocs(userProblemRef);
      userProblemSnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        temp.push(doc.data());
      });
      setUserProblems(temp);
    };

    if (user) getUserProblems();
    if (!user) setUserProblems([]);
  }, [user]);

  return userProblems;
}

export default useGetUserProblems;
