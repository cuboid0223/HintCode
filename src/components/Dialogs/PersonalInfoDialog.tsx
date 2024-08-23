"use client";
import useGetUserInfo, { useGetSubscribedUser } from "@/hooks/useGetUserInfo";
import React, { useEffect, useState } from "react";
import { animated } from "react-spring";
import useGetUsers, {
  useGetSubscribedUsers,
  useUserTransitions,
} from "@/hooks/useUsers";
import { User } from "../../types/global";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CountUp from "react-countup";
import Avatar from "../Avatar";
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
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

function PersonalInfoDialog({
  isPersonalInfoDialogOpen,
  togglePersonalInfoDialog,
}) {
  const targetUser = useGetUserInfo();
  const currentUser = useGetSubscribedUser();
  const users = useGetUsers();
  // const userData = useGetUserInfo();
  const currentUsers = useGetSubscribedUsers();
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const transitionsNearbyUsers = useUserTransitions(nearbyUsers);
  const findUserIndex = (users: User[], target: User) => {
    if (users.length === 0 || !target) return;
    return users.findIndex((user) => user.uid === target?.uid);
  };
  useEffect(() => {
    const findNearbyUsers = (
      users: User[],
      target: User,
      range: number = 2
    ): User[] => {
      if (!users) return;
      const targetIndex = findUserIndex(users, target);
      const startIndex = Math.max(0, targetIndex - range);
      const endIndex = Math.min(users.length - 1, targetIndex + range);

      return users.slice(startIndex, endIndex + 1);
    };

    setNearbyUsers(findNearbyUsers(users, targetUser));
    setUserIndex(findUserIndex(users, targetUser));
  }, [users, targetUser]);

  useEffect(() => {
    // if (!targetUser) return;

    setNearbyUsers((prevNearbyUsers) => {
      const updatedUsers = prevNearbyUsers.map((user) =>
        user.uid === targetUser.uid
          ? { ...user, completionRate: currentUser.completionRate }
          : user
      );

      return updatedUsers.sort((a, b) => b.completionRate - a.completionRate);
    });
  }, [currentUser?.completionRate, targetUser]);

  useEffect(() => {
    console.log(currentUsers);
    setUserIndex(findUserIndex(currentUsers, targetUser));
  }, [targetUser, currentUsers]);

  return (
    <Dialog
      open={isPersonalInfoDialogOpen}
      onOpenChange={togglePersonalInfoDialog}
    >
      <HoverCard>
        <HoverCardTrigger className="cursor-pointer">
          <DialogTrigger>
            <Avatar svg={targetUser?.thumbnail} />
          </DialogTrigger>
        </HoverCardTrigger>
        <HoverCardContent className="flex min-w-xs">
          <p>email: {targetUser?.email}</p>
        </HoverCardContent>
      </HoverCard>
      <DialogContent className="max-w-2xl max-h-96">
        <DialogHeader>
          <DialogTitle className=" flex justify-between items-center">
            <p> {targetUser?.displayName}</p>
            <p className="mr-4">{targetUser?.unit.id.toUpperCase()}</p>
          </DialogTitle>
          {/* <VisuallyHidden.Root asChild>
                    <DialogTitle>{targetUser.displayName}</DialogTitle>
                  </VisuallyHidden.Root> */}

          <VisuallyHidden.Root asChild>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <div className="flex">
          <section className="p-2">
            <Avatar svg={targetUser?.thumbnail_64px} />

            {/* 完成率 */}
            <pre className="mt-2">完成率: </pre>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              <CountUp
                start={targetUser?.completionRate}
                end={currentUser?.completionRate}
                duration={2}
                separator=" "
                // decimals={4}
                // decimal=","
                // prefix="EUR "
                suffix="%"
                // onEnd={() => console.log("Ended! 👏")}
                // onStart={() => console.log("Started! 💨")}
              >
                {({ countUpRef, start }) => (
                  <div>
                    <span ref={countUpRef} />
                  </div>
                )}
              </CountUp>
            </h1>
            {/* users rank */}
            <pre>排名: </pre>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              {userIndex + 1}/{users?.length}
            </h1>
          </section>
          {/* rank list  */}
          <Table className=" text-center  ">
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader className="">
              <TableRow className="grid grid-cols-3">
                <TableHead className="p-0 text-center">完成率</TableHead>
                <TableHead className="p-0 text-center">名字</TableHead>
                <TableHead className="p-0 text-center">頭像</TableHead>
                {/* <TableHead className="p-0 text-center">排名</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              {transitionsNearbyUsers((styles, user, state, index) => (
                <animated.tr
                  className="grid grid-cols-3  absolute w-full  border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  style={{
                    zIndex: 5 - index,
                    willChange: "transform, height, opacity",
                    ...styles,
                  }}
                >
                  <TableCell className="">{user.completionRate} %</TableCell>
                  <TableCell className="">{user.displayName}</TableCell>
                  <TableCell className="flex place-content-center">
                    <Avatar svg={user?.thumbnail} />
                  </TableCell>
                  {/* <TableCell className="font-bold text-xl ">
                {userIndex + 1}
              </TableCell> */}
                </animated.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PersonalInfoDialog;
