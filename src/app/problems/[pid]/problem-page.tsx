"use client";
import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
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
    // const addData = async () => {
    //   const problemRef = doc(firestore, "problems", problem.id);
    //   await setDoc(problemRef, problem);
    // };
    // addData();
    // get problem data from firestore
    // store in global state
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

// fetch the local data
//  SSG
// getStaticPaths => it create the dynamic routes
// export async function getStaticPaths() {
//   const paths = Object.keys(problems).map((key) => ({
//     params: { pid: key },
//   }));

//   return {
//     paths,
//     fallback: false,
//   };
// }

// getStaticProps => it fetch the data

// export async function getStaticProps({ params }: { params: { pid: string } }) {
//   const { pid } = params;
//   const problem = problems[pid];

//   if (!problem) {
//     return {
//       notFound: true,
//     };
//   }
//   problem.handlerFunction = problem.handlerFunction.toString();
//   return {
//     props: {
//       problem,
//     },
//   };
// }
