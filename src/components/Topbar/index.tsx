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
import { AuthModal } from "../../../types/global";
import useGetProblems from "@/hooks/useGetProblems";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import Thumbnail from "../Thumbnail";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PersonalInfo from "../PersonalInfo";
import { useRecoilState } from "recoil";
import { isPersonalInfoDialogOpenState } from "@/atoms/isPersonalInfoDialogOpen";
import LogoutButton from "../Topbar/components/LogoutBtn";
import { submissionsDataState } from "@/atoms/submissionsDataAtom";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
type TopbarProps = {
  isProblemPage?: boolean;
  authModal?: AuthModal;
  setAuthModal?: React.Dispatch<React.SetStateAction<AuthModal>>;
};

const Topbar: React.FC<TopbarProps> = ({
  isProblemPage,
  setAuthModal,
  authModal,
}) => {
  const [user] = useAuthState(auth);
  const userData = useGetUserInfo();
  const router = useRouter();
  const { setTheme } = useTheme();
  const params = useParams<{ pid: string }>();
  const [submissionsData, setSubmissionsData] =
    useRecoilState(submissionsDataState);
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] =
    useRecoilState(isPersonalInfoDialogOpenState);
  const [isProblemsLoading, setIsProblemsLoading] = useState(false);
  const problems = useGetProblems(setIsProblemsLoading);

  const handleProblemChange = (isForward: boolean) => {
    const pid = params?.pid; // 當下題目的 pid
    if (!pid || !problems) return;

    const problem = problems.find((p) => p.id === pid);

    const direction = isForward ? 1 : -1;
    const nextProblemOrder = problem.order + direction;
    const nextProblem = problems.find((p) => p.order === nextProblemOrder);
    setSubmissionsData({ problemId: pid, submissions: [] });
    if (isForward && !nextProblem) {
      //  處理 edge case 當沒有下一個問題且是點 "往前" 給使用者第一個 problem
      const firstProblem = problems.find((p) => p.order === 1);
      router.push(`/problems/${firstProblem.id}`);
    } else if (!isForward && !nextProblem) {
      //  處理 edge case 當沒有下一個問題且是點 "往後" 給使用者最後一個 problem
      const lastProblem = problems.find((p) => p.order === problems.length);
      router.push(`/problems/${lastProblem.id}`);
    } else {
      router.push(`/problems/${nextProblem.id}`);
    }
  };

  const togglePersonalInfoDialog = () => {
    setIsPersonalInfoDialogOpen(!isPersonalInfoDialogOpen);
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
          <h1>HintCode</h1>
        </Link>

        {isProblemPage && (
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={() => handleProblemChange(false)}
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
              onClick={() => handleProblemChange(true)}
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
            {/* box-shadow:  -23px 23px 46px #d0d0d0,
             23px -23px 46px #ffffff; */}
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
              {/* <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
          {!user && (
            <Link
              href="/auth"
              onClick={() =>
                setAuthModal((prev) => ({
                  ...prev,
                  isOpen: true,
                  type: "login",
                }))
              }
            >
              <button className="bg-dark-fill-3 py-1 px-2 cursor-pointer rounded ">
                登入
              </button>
            </Link>
          )}
          {user && isProblemPage && <Timer />}
          {user && (
            <Dialog
              open={isPersonalInfoDialogOpen}
              onOpenChange={togglePersonalInfoDialog}
            >
              <HoverCard>
                <HoverCardTrigger className="cursor-pointer">
                  <DialogTrigger>
                    <Thumbnail svg={userData?.thumbnail} />
                  </DialogTrigger>
                </HoverCardTrigger>
                <HoverCardContent className="flex min-w-xs">
                  <p>email: {userData?.email}</p>
                </HoverCardContent>
              </HoverCard>
              <DialogContent className="max-w-2xl max-h-96">
                <DialogHeader>
                  <DialogTitle className=" flex justify-between items-center">
                    <p> {userData?.displayName}</p>
                    <p className="mr-4">{userData?.unit}</p>
                  </DialogTitle>
                  {/* <VisuallyHidden.Root asChild>
                    <DialogTitle>{userData.displayName}</DialogTitle>
                  </VisuallyHidden.Root> */}

                  <VisuallyHidden.Root asChild>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                  </VisuallyHidden.Root>
                </DialogHeader>

                <PersonalInfo />
              </DialogContent>
            </Dialog>
          )}

          {user && <LogoutButton />}
        </div>
      </div>
    </nav>
  );
};
export default Topbar;
