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

export default function Home() {
  const [loadingProblems, setLoadingProblems] = useState(true);
  const problems = useGetProblems(setLoadingProblems);
  const userProblems = useGetUserProblems();

  return (
    <>
      <Topbar />
      <main className="container relative overflow-x-auto mx-auto">
        {loadingProblems && <LoadingTableSkeleton />}
        {/* 問題列表 */}
        <Table className="my-6 ">
          {!loadingProblems && (
            <>
              <TableHeader>
                <TableRow className="grid grid-cols-5 gap-4">
                  <TableHead className="w-[100px]">狀態</TableHead>
                  <TableHead>標題</TableHead>
                  <TableHead>難易度</TableHead>
                  <TableHead>類別</TableHead>
                  <TableHead>得分</TableHead>

                  {/* <TableHead className="text-right">Solution</TableHead> */}
                </TableRow>
              </TableHeader>
            </>
          )}
          <TableBody className="text-white">
            {problems.map((problem, idx) => {
              const userProblem = userProblems.find((e) => e.id === problem.id);
              const difficultyColor =
                problem.difficulty === "Easy"
                  ? "text-dark-green-s"
                  : problem.difficulty === "Medium"
                    ? "text-dark-yellow"
                    : "text-dark-pink";
              return (
                <TableRow
                  key={problem.id}
                  className={`grid grid-cols-5 gap-4 text-foreground   ${
                    idx % 2 == 1 ? "bg-slate-200 dark:bg-dark-layer-1" : ""
                  }`}
                >
                  <TableCell className=" font-medium whitespace-nowrap text-dark-green-s">
                    {userProblem?.is_solved && (
                      <BsCheckCircle fontSize={"18"} width="18" />
                    )}
                  </TableCell>
                  <TableCell className="p-0  dark:text-white ">
                    <Link
                      className="h-full flex cursor-pointer"
                      // target="_blank"
                      href={`/problems/${problem.id}`}
                    >
                      <p className="place-content-center hover:text-blue-600">
                        {problem.title}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell className={` ${difficultyColor} `}>
                    {problem.difficulty}
                  </TableCell>
                  <TableCell className={"dark:text-white"}>
                    {problem.category}
                  </TableCell>
                  <TableCell className={"dark:text-white"}>
                    {`${userProblem?.score || 0} / ${problem.score}`}
                  </TableCell>
                </TableRow>
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
