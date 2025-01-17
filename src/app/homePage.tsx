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
import useGetUserProblems, {
  useSubscribedUserProblems,
} from "@/hooks/useGetUserProblems";
import useGetProblems from "@/hooks/useGetProblems";
import { LoadingTableSkeleton } from "./loading";
import { Progress } from "@/components/ui/progress";
import {
  BotMessageSquare,
  BotOff,
  CircleCheckBig,
  CircleDashed,
  Lock,
} from "lucide-react";
import {
  submissionsState,
  SubmissionsState,
} from "@/atoms/submissionsDataAtom";
import { useRecoilState } from "recoil";
import { Problem, UserProblem } from "@/types/problem";
import { percentage } from "@/utils/percentage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import CountUp from "react-countup";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { DIFFICULTY_CLASSES } from "@/utils/const";
import createUserProblem from "@/utils/problems/createUserProblem";

export default function Home() {
  const [user] = useAuthState(auth);
  const userInfo = useGetUserInfo();
  const [loadingProblems, setLoadingProblems] = useState(true);
  // const [progressValue, setProgressValue] = useState(0);
  const { problems } = useGetProblems(setLoadingProblems);
  const userProblems = useSubscribedUserProblems();
  const [submissions, setSubmissions] =
    useRecoilState<SubmissionsState>(submissionsState);

  useEffect(() => {
    setSubmissions([]);
  }, [setSubmissions]);

  useEffect(() => {
    const findMissingProblems = (
      problems: Problem[],
      userProblems: UserProblem[]
    ): Problem[] => {
      return problems.filter(
        (problem) =>
          !userProblems.some((userProblem) => userProblem.id === problem.id)
      );
    };

    const createMissingUserProblems = async (
      userId: string,
      problems: Problem[],
      userProblems: UserProblem[]
    ) => {
      // 找到 problems 中不在 userProblems 裡的物件
      if (!userId || !problems) return;
      const missingProblems = findMissingProblems(problems, userProblems);
      // console.log(`使用者缺少的文件: ${JSON.stringify(missingProblems)}`);
      for (const problem of missingProblems) {
        // console.log(`使用者(${userId}) 建立 ${problem.id} 文件 `);
        await createUserProblem(userId, problem.id);
      }
    };
    createMissingUserProblems(user?.uid, problems, userProblems);
  }, [user?.uid, problems, userProblems]);

  return (
    <>
      <Topbar />
      <main className="container relative mx-auto ">
        {loadingProblems && <LoadingTableSkeleton />}
        {/* 完成進度條 */}
        <section className="flex items-center gap-3 mt-3">
          <h1 className="text-xl font-extrabold tracking-tight lg:text-base">
            <CountUp
              start={0}
              end={
                userInfo ? parseFloat(userInfo.completionRate.toFixed(1)) : 0
              }
              duration={2}
              separator=" "
              suffix="%"
            >
              {({ countUpRef, start }) => (
                <div>
                  <span className="font-['Orbitron']" ref={countUpRef} />
                </div>
              )}
            </CountUp>
          </h1>
          <Progress value={userInfo?.completionRate} max={100} />
        </section>

        {/* 問題列表 */}
        <Table>
          {!loadingProblems && (
            <TableHeader>
              <TableRow className="grid gap-3 grid-cols-3  md:grid-cols-5 md:gap-4">
                <TableHead className="w-[100px]">狀態</TableHead>
                <TableHead>標題</TableHead>
                <TableHead>難易度</TableHead>
                <TableHead className="md:block  hidden">類別</TableHead>
                <TableHead className="md:block  hidden">提示</TableHead>
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
                  userId={user?.uid}
                />
              );
            })}
          </TableBody>
        </Table>

        {/* pagination  */}
        {/* <Pagination>
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
        </Pagination> */}
      </main>
    </>
  );
}

type ProblemRowProps = {
  problem: Problem;
  userProblem: UserProblem;
  idx: number;
  userId: string;
};

const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  userProblem,
  idx,
  userId,
}) => {
  const difficultyColor = DIFFICULTY_CLASSES[problem.difficulty] || "";
  const userProblems = useGetUserProblems();

  return (
    <TableRow
      key={problem.id}
      //${Math.floor(idx / 2) % 2 === 1 ? "bg-slate-200 dark:bg-dark-layer-1 " : ""}
      className={`grid gap-3 grid-cols-3  md:grid-cols-5 md:gap-4  text-foreground ${Math.floor(idx / 2) % 2 === 1 ? "bg-slate-200 dark:bg-dark-layer-1 " : ""} `}
    >
      <TableCell className="font-medium whitespace-nowrap">
        {userProblem?.is_solved ? (
          <CircleCheckBig
            className="text-dark-green-s"
            fontSize="18"
            width="18"
          />
        ) : userProblem?.isLocked ? (
          <Lock color="red" />
        ) : (
          <CircleDashed fontSize="18" width="18" />
        )}
      </TableCell>
      <TableCell className="p-0 dark:text-white">
        <Link
          className={`h-full flex ${userProblem?.isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
          href={
            userProblem?.isLocked
              ? "#"
              : `/problems/${problem.id}?userId=${userId}`
          }
          // onClick={(e) => {
          //   if (userProblem?.isLocked) {
          //     e.preventDefault();
          //   }
          // }}
        >
          <p className="place-content-center hover:text-blue-600  sm:text-xs md:text-base	">
            {problem.title}
          </p>
        </Link>
      </TableCell>
      <TableCell
        className={`${difficultyColor} font-['Orbitron']  tracking-widest`}
      >
        {problem.difficulty}
      </TableCell>
      <TableCell
        className={` font-['Orbitron'] dark:text-white tracking-widest md:block hidden`}
      >
        {problem.category}
      </TableCell>
      <TableCell className="dark:text-white md:block hidden">
        {problem.isHelpEnabled ? <BotMessageSquare /> : <BotOff />}
      </TableCell>
    </TableRow>
  );
};
