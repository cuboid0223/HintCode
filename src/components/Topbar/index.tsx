"use client";
import { auth } from "../../firebase/firebase";
import Link from "next/link";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import Timer from "../Timer";
import { useRouter, useParams } from "next/navigation";
import { Moon, Sun, Trophy } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from "../../types/global";
import useGetProblems from "@/hooks/useGetProblems";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { Orbitron } from "next/font/google";
import { useRecoilState } from "recoil";
import { isPersonalInfoDialogOpenState } from "@/atoms/isPersonalInfoDialogOpen";
import LogoutButton from "../Topbar/components/LogoutBtn";
import { submissionsState } from "@/atoms/submissionsDataAtom";

const orbitron = Orbitron({
  weight: "600",
  subsets: ["latin"],
});

import PersonalInfoDialog from "../Dialogs/PersonalInfoDialog";
type TopBarProps = {
  isProblemPage?: boolean;
};

const TopBar: React.FC<TopBarProps> = ({ isProblemPage }) => {
  const [user] = useAuthState(auth);

  // const router = useRouter();
  const { setTheme } = useTheme();
  // const params = useParams<{ pid: string }>();
  // const [submissionsData, setSubmissions] = useRecoilState(submissionsState);
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] =
    useRecoilState(isPersonalInfoDialogOpenState);
  const [isProblemsLoading, setIsProblemsLoading] = useState(false);
  const { problems, handleProblemChange } =
    useGetProblems(setIsProblemsLoading);

  const togglePersonalInfoDialog = () => {
    setIsPersonalInfoDialogOpen(!isPersonalInfoDialogOpen);
  };
  const goToNextProblem = () => {
    handleProblemChange(true);
  };

  const goToPreviousProblem = () => {
    handleProblemChange(false);
  };

  return (
    <nav className="relative flex h-[50px] w-full shrink-0 items-center px-5 dark:bg-dark-layer-1 bg-card text-dark-gray-7">
      <div
        className={`flex w-full items-center justify-between ${
          !isProblemPage ? "max-w-[1200px] mx-auto" : ""
        }`}
      >
        <Link href="/" className="h-[45px] flex-1 flex items-center">
          <Image src="/HINTCode.png" alt="Logo" height={45} width={45} />
          <h1 className={orbitron.className}>HintCode</h1>
        </Link>

        {isProblemPage && (
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={goToPreviousProblem}
            >
              <FaChevronLeft />
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 font-medium max-w-[170px] dark:text-dark-gray-8 cursor-pointer"
            >
              <div>
                <BsList />
              </div>
              <p>問題列表</p>
            </Link>
            <div
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={goToNextProblem}
            >
              <FaChevronRight />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 flex-1 justify-end">
          {user && (
            <Link href="/rank">
              <Button variant="outline" size="icon">
                <Trophy className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="">
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("cyber")}>
                Cyber
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!user && (
            <Link href="/auth">
              <button className="bg-dark-fill-3 py-1 px-2 cursor-pointer rounded ">
                登入
              </button>
            </Link>
          )}
          {user && isProblemPage && <Timer />}
          {user && (
            <PersonalInfoDialog
              togglePersonalInfoDialog={togglePersonalInfoDialog}
              isPersonalInfoDialogOpen={isPersonalInfoDialogOpen}
            />
          )}

          {user && <LogoutButton />}
        </div>
      </div>
    </nav>
  );
};
export default TopBar;
