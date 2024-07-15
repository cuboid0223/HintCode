import { auth, firestore } from "@/firebase/firebase";
import { UserProblem } from "../types/problem";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
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

const fetchSubscribedUserProblems = async (
  uid: string,
  setUserProblems: React.Dispatch<UserProblem[]>
) => {
  try {
    const q = query(collection(firestore, "users", uid, "problems"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const problems: UserProblem[] = [];
      querySnapshot.forEach((doc) => {
        problems.push(doc.data() as UserProblem);
      });

      // console.log("users: ", problems);
      setUserProblems(problems);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// 隨時監聽 user problems 變化
const useSubscribedUserProblems = () => {
  const [user] = useAuthState(auth);
  const [userProblems, setUserProblems] = useState<UserProblem[]>([]);
  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe: (() => void) | undefined;

    const fetchAndSubscribe = async () => {
      unsubscribe = await fetchSubscribedUserProblems(
        user?.uid,
        setUserProblems
      );
    };

    fetchAndSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  return userProblems;
};

export default useGetUserProblems;
export { useSubscribedUserProblems };
