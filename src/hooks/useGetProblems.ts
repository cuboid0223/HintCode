import { firestore } from "@/firebase/firebase";
import { Problem } from "../types/problem";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { submissionsState } from "@/atoms/submissionsDataAtom";
import { useRouter, useParams } from "next/navigation";

function useGetProblems(
  setLoadingProblems?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const router = useRouter();
  const params = useParams<{ pid: string }>();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissionsData, setSubmissions] = useRecoilState(submissionsState);

  const handleProblemChange = async (
    isForward: boolean = true,
    userId: string
  ) => {
    // 當下題目的 pid
    const pid = params?.pid; // 當下題目的 pid
    if (!pid || !problems) return;

    const problem = problems.find((p) => p.id === pid);

    const direction = isForward ? 1 : -1;
    const nextProblemOrder = problem.order + direction;
    const nextProblem = problems.find((p) => p.order === nextProblemOrder);
    setSubmissions([]);
    if (isForward && !nextProblem) {
      //  處理 edge case 當沒有下一個問題且是點 "往前" 給使用者第一個 problem
      const firstProblem = problems.find((p) => p.order === 1);
      router.push(`/problems/${firstProblem.id}?userId=${userId}`);
    } else if (!isForward && !nextProblem) {
      //  處理 edge case 當沒有下一個問題且是點 "往後" 給使用者最後一個 problem
      const lastProblem = problems.find((p) => p.order === problems.length);
      router.push(`/problems/${lastProblem.id}?userId=${userId}`);
    } else {
      router.push(`/problems/${nextProblem.id}?userId=${userId}`);
    }
  };

  useEffect(() => {
    const getProblems = async () => {
      setLoadingProblems && setLoadingProblems(true);
      const q = query(
        collection(firestore, "problems"),
        where("isPublished", "==", true),
        orderBy("order", "asc")
      );
      const querySnapshot = await getDocs(q);
      const tmp: Problem[] = [];
      querySnapshot.forEach((doc) => {
        tmp.push({ id: doc.id, ...doc.data() } as Problem);
      });

      setProblems(tmp);
      setLoadingProblems && setLoadingProblems(false);
    };

    getProblems();
  }, [setLoadingProblems]);
  return { problems, handleProblemChange };
}

export default useGetProblems;
