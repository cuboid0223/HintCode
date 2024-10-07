"use client";
import Topbar from "@/components/Topbar";
import Workspace from "@/components/Workspace";
import useHasMounted from "@/hooks/useHasMounted";
import { Problem } from "@/types/problem";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";
import getUserProblemById from "@/utils/problems/getUserProblemById";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { getMaintenanceSettings } from "@/utils/problems/getSettings";
import { SUPER_USER } from "@/utils/const";
import MaintainedPage from "@/components/Maintained";

type ProblemPageProps = {
  problem: Problem;
};

const ProblemPage: React.FC<ProblemPageProps> = ({ problem }) => {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const userInfo = useGetUserInfo();
  const [problemData, setProblemData] = useRecoilState(problemDataState);
  const { pid } = useParams<{ pid: string }>();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setProblemData(problem);
  }, [problem, setProblemData]);

  useEffect(() => {
    const fetchUserProblem = async () => {
      try {
        const userProblem = await getUserProblemById(userId, pid);
        setIsLocked(userProblem.isLocked);
      } catch (error) {
        console.error("Error fetching user problem:", error);
      }
    };

    if (userId !== "undefined" && pid) {
      fetchUserProblem();
    }
  }, [pid, userId]);

  // 如果 isLocked 為 true，則進行跳轉，避免進行不必要的渲染
  useEffect(() => {
    if (isLocked) router.push(`/locked?pid=${pid}`);
  }, [isLocked, pid, router]);

  useEffect(() => {
    const returnMaintainPage = async (userInfo) => {
      if (!userInfo) return;
      const isMaintained = await getMaintenanceSettings();
      if (userInfo.role !== SUPER_USER && isMaintained) {
        return <MaintainedPage />;
      }
    };

    returnMaintainPage(userInfo);
  }, [userInfo]);

  if (!hasMounted || isLocked) return null;

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Topbar isProblemPage />
      <Workspace />
    </main>
  );
};

export default ProblemPage;
