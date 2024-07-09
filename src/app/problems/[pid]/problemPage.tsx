"use client";
import Topbar from "@/components/Topbar";
import Workspace from "@/components/Workspace";
import useHasMounted from "../../../hooks/useHasMounted";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Problem } from "@/utils/types/problem";
import React, { useEffect } from "react";
import { firestore } from "@/firebase/firebase";
import { useRecoilState } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";

type ProblemPageProps = {
  problem: Problem;
};

const ProblemPage: React.FC<ProblemPageProps> = ({ problem }) => {
  const hasMounted = useHasMounted();
  const [problemData, setProblemData] = useRecoilState(problemDataState);

  useEffect(() => {
    setProblemData(problem);
  }, [problem, setProblemData]);

  if (!hasMounted) return null;
  return (
    <div className="flex flex-col h-screen  overflow-hidden">
      <Topbar isProblemPage />
      <Workspace />
    </div>
  );
};
export default ProblemPage;
