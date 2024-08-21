"use client";
import Topbar from "@/components/Topbar";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { BsCheckCircle } from "react-icons/bs";
import useGetUserProblems from "@/hooks/useGetUserProblems";
import useGetProblems from "@/hooks/useGetProblems";
import { LoadingTableSkeleton } from "./loading";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";

import {
  BotMessageSquare,
  BotOff,
  CircleCheckBig,
  CircleDashed,
} from "lucide-react";
import {
  submissionsState,
  SubmissionsState,
} from "@/atoms/submissionsDataAtom";
import { useRecoilState } from "recoil";
import { Problem, UserProblem } from "@/types/problem";
import { percentage } from "@/utils/percentage";
import { Orbitron } from "next/font/google";

const DIFFICULTY_CLASSES = {
  Easy: "text-dark-green-s",
  Medium: "text-dark-yellow",
  Hard: "text-dark-pink",
};

const orbitron = Orbitron({
  weight: "400",
  subsets: ["latin"],
});

const mockMatrix = [
  ["hello-world", "greet-n-times"],
  ["two-sum", "findgcd"],
];

export default function Home() {
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const { problems } = useGetProblems(setLoadingProblems);
  const userProblems = useGetUserProblems();

  const [submissions, setSubmissions] =
    useRecoilState<SubmissionsState>(submissionsState);
  useEffect(() => {
    setSubmissions([]);
    const solvedProblems = (problems: UserProblem[]) => {
      return problems.filter((p) => {
        return p.is_solved;
      });
    };

    setProgressValue(
      percentage(solvedProblems(userProblems).length, problems.length)
    );
  }, [setSubmissions, userProblems, problems.length]);

  return (
    <>
      <Topbar />
      <main className="container relative overflow-x-auto mx-auto grid gap-6 grid-cols-1">
        {loadingProblems && <LoadingTableSkeleton />}
        {/* 完成進度條 */}
        <Progress className="mt-3" value={progressValue} max={100} />
        {/* 問題列表 */}
        <Table className="">
          {!loadingProblems && (
            <TableHeader>
              <TableRow className="grid grid-cols-5 gap-4">
                <TableHead className="w-[100px]">狀態</TableHead>
                <TableHead>標題</TableHead>
                <TableHead>難易度</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>提示</TableHead>
              </TableRow>
            </TableHeader>
          )}
          <TableBody className="text-white">
            {problems.map((problem, idx) => {
              const userProblem = userProblems.find((e) => e.id === problem.id);
              return (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  userProblem={userProblem}
                  idx={idx}
                />
              );
            })}
          </TableBody>
        </Table>

        {/* pagination  */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </main>
    </>
  );
}

type ProblemRowProps = {
  problem: Problem;
  userProblem: UserProblem;
  idx: number;
};

const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  userProblem,
  idx,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const difficultyColor = DIFFICULTY_CLASSES[problem.difficulty] || "";
  const userProblems = useGetUserProblems();
  useEffect(() => {
    console.log(userProblems);

    const prevProblemIsSolved = (userProblems: UserProblem[]) => {
      if (userProblems.length === 0 && idx % 2 !== 0) {
        setIsLocked(true);
        return;
      }
      const result = mockMatrix.find((subArray) =>
        subArray.includes(userProblem?.id)
      );
      console.log("目標 array", result);
      if (result) {
        const index = result.indexOf(userProblem.id);
        if (index > 0) {
          const previousElementId = result[index - 1];

          const previousProblems = userProblems.filter(
            (p) => p.id === previousElementId
          );
          console.log(previousProblems);
          if (previousProblems[0]?.is_solved) {
            setIsLocked(false);
            return;
          }
          setIsLocked(true);
        } else {
          console.log("找不到前一個元素");
        }
      } else {
        console.log("找不到 'greet-n-times'");
      }
    };

    prevProblemIsSolved(userProblems);
  }, [idx, userProblems, userProblem?.id]);

  return (
    <TableRow
      key={problem.id}
      //${Math.floor(idx / 2) % 2 === 1 ? "bg-slate-200 dark:bg-dark-layer-1 " : ""}
      className={`grid grid-cols-5 gap-4 text-foreground   ${isLocked && "bg-red-400 "}`}
    >
      <TableCell className="font-medium whitespace-nowrap">
        {userProblem?.is_solved ? (
          <CircleCheckBig
            className="text-dark-green-s"
            fontSize="18"
            width="18"
          />
        ) : (
          <CircleDashed fontSize="18" width="18" />
        )}
      </TableCell>
      <TableCell className="p-0 dark:text-white">
        <Link
          className="h-full flex cursor-pointer"
          href={`/problems/${problem.id}`}
        >
          <p className="place-content-center hover:text-blue-600">
            {problem.title}
          </p>
        </Link>
      </TableCell>
      <TableCell
        className={`${difficultyColor} ${orbitron.className}  tracking-widest`}
      >
        {problem.difficulty}
      </TableCell>
      <TableCell
        className={` ${orbitron.className} dark:text-white tracking-widest`}
      >
        {problem.category}
      </TableCell>
      <TableCell className="dark:text-white">
        {problem.isHelpEnabled ? <BotMessageSquare /> : <BotOff />}
      </TableCell>
    </TableRow>
  );
};
