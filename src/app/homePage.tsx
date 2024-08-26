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
import useGetUserProblems from "@/hooks/useGetUserProblems";
import useGetProblems from "@/hooks/useGetProblems";
import { LoadingTableSkeleton } from "./loading";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
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
import updateProblemLockStatus from "@/utils/problems/updateProblemLockStatus";
import useGetProblemGroup from "@/hooks/useGetProblemGroup";
import CountUp from "react-countup";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { DIFFICULTY_CLASSES, orbitron } from "@/utils/const";
import createUserProblem from "@/utils/problems/createUserProblem";

export default function Home() {
  const [user] = useAuthState(auth);
  const userInfo = useGetUserInfo();
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
        <section className="flex items-center gap-3 mt-3">
          <h1 className=" text-xl font-extrabold tracking-tight lg:text-base">
            <CountUp
              start={0}
              end={userInfo?.completionRate}
              duration={2}
              separator=" "
              suffix="%"
            >
              {({ countUpRef, start }) => (
                <div>
                  <span className={`${orbitron.className}`} ref={countUpRef} />
                </div>
              )}
            </CountUp>
          </h1>
          <Progress className="" value={progressValue} max={100} />
        </section>

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
  const [isLocked, setIsLocked] = useState(false);
  const difficultyColor = DIFFICULTY_CLASSES[problem.difficulty] || "";
  const userProblems = useGetUserProblems();
  const { problemGroup } = useGetProblemGroup();

  useEffect(() => {
    const handleNextProblemUnlocked = async (
      pid: string,
      userProblems: UserProblem[],
      problemGroup: string[]
    ) => {
      // 獲取當前問題所在的組
      const targetGroup = problemGroup.find((group) => group.includes(pid));

      if (targetGroup && targetGroup.length !== 0) {
        // 找出當前問題的索引
        const currentProblemIndex = targetGroup.indexOf(pid);
        console.log(currentProblemIndex);
        // 如果下一個題目存在，檢查它是否解鎖
        if (currentProblemIndex === 0) {
          const nextProblemId = targetGroup[currentProblemIndex + 1];
          const nextProblems = userProblems.filter(
            (p) => p.id === nextProblemId
          );
          const currentProblems = userProblems.filter((p) => p.id === pid);

          if (nextProblems.length === 0 && currentProblems[0]?.is_solved) {
            // nextProblems.length === 0 表示下一題的 doc 未被建立
            await createUserProblem(userId, nextProblemId);
            await updateProblemLockStatus(userId, nextProblemId, false); // 更新 Firebase 狀態
            console.log(`建立${nextProblemId}中，並設置 isLocked 為 true`);
            return;
          }

          if (nextProblems.length > 0 && !currentProblems[0]?.is_solved) {
            // 有下一題的 doc 但上一題沒被解決
            updateProblemLockStatus(userId, nextProblemId, true); // 更新 Firebase 狀態
            console.log(
              `有${nextProblemId}文件，但上一題${currentProblems[0]}沒被解決，設置 isLocked 為 false`
            );
            return;
          }
        } else {
          // currentProblemIndex === 1; 表示該題沒有下一題
        }
      } else {
        console.log(`找不到題目組: ${pid}`);
      }
    };

    // 獲取用戶解題資料後執行
    handleNextProblemUnlocked(problem?.id, userProblems, problemGroup);
  }, [idx, userProblems, problem?.id, userId, problemGroup]);

  return (
    <TableRow
      key={problem.id}
      //${Math.floor(idx / 2) % 2 === 1 ? "bg-slate-200 dark:bg-dark-layer-1 " : ""}
      className={`grid grid-cols-5 gap-4 text-foreground ${Math.floor(idx / 2) % 2 === 1 ? "bg-slate-200 dark:bg-dark-layer-1 " : ""} `}
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
          href={ userProblem?.isLocked ? "#" : `/problems/${problem.id}?userId=${userId}`}
          onClick={(e) => {
            if (userProblem?.isLocked) {
              e.preventDefault();
            }
          }}
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
