import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import useGetUserProblems from "@/hooks/useGetUserProblems";
import useGetProblems from "@/hooks/useGetProblems";

type ProblemsTableProps = {
  setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProblemsTable: React.FC<ProblemsTableProps> = ({
  setLoadingProblems,
}) => {
  const { problems } = useGetProblems(setLoadingProblems);
  const userProblems = useGetUserProblems();

  return (
    <>
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
              <TableCell className=" dark:text-white">
                <Link
                  className="block cursor-pointer  "
                  target="_blank"
                  href={`/problems/${problem.id}`}
                >
                  <p className="hover:text-blue-600">{problem.title}</p>
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
    </>
  );
};
export default ProblemsTable;
