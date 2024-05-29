"use client";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import Topbar from "@/components/Topbar/Topbar";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RankingList from "@/components/RankingList";
export default function Home() {
  const [loadingProblems, setLoadingProblems] = useState(true);

  return (
    <>
      <main className="">
        <Topbar />

        <div className="container relative overflow-x-auto mx-auto">
          {loadingProblems && (
            <div className="max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse">
              {[...Array(10)].map((_, idx) => (
                <LoadingSkeleton key={idx} />
              ))}
            </div>
          )}
          {/* 問題列表 */}
          <Table>
            {!loadingProblems && (
              <>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Category</TableHead>
                    {/* <TableHead className="text-right">Solution</TableHead> */}
                  </TableRow>
                </TableHeader>
              </>
            )}
            <ProblemsTable setLoadingProblems={setLoadingProblems} />
          </Table>
          {/* 排行榜 */}
          <RankingList />
        </div>
      </main>
    </>
  );
}

const LoadingSkeleton = () => {
  return (
    <div className="flex items-center space-x-12 mt-4 px-6">
      <div className="w-6 h-6 shrink-0 rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52  w-32  rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52  w-32 rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
