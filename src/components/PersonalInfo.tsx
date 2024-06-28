"use client";

import useGetUserInfo from "@/hooks/useGetUserInfo";
import React, { useEffect, useState } from "react";
import { animated } from "react-spring";
import Thumbnail from "./Thumbnail";
import { useGetSubscribedUsers, useUserTransitions } from "@/hooks/useUsers";
import { User } from "@/utils/types/global";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function PersonalInfo() {
  const targetUserInfo = useGetUserInfo();
  const users = useGetSubscribedUsers();
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [userIndex, setUserIndex] = useState(0);

  const transitionsNearbyUsers = useUserTransitions(nearbyUsers);

  useEffect(() => {
    const findUserIndex = (users: User[], target: User) => {
      return users.findIndex((user) => user.uid === target?.uid);
    };
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

    setNearbyUsers(findNearbyUsers(users, targetUserInfo));
    setUserIndex(findUserIndex(users, targetUserInfo));
  }, [users, targetUserInfo]);

  return (
    <div className="bg-red-500 flex ">
      <section className="">
        <Thumbnail svg={targetUserInfo?.thumbnail_64px} />

        {/* score */}
        <pre>總分: </pre>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {targetUserInfo?.totalScore}
        </h1>
        {/* users rank */}
        <pre>排名: </pre>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {userIndex + 1} / {users?.length}
        </h1>
      </section>
      {/* rank list  */}
      <Table className="h-full text-center max-w-xs">
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader className="">
          <TableRow className="grid grid-cols-3">
            <TableHead className="p-0 text-center">總分</TableHead>
            <TableHead className="p-0 text-center">名字</TableHead>
            <TableHead className="p-0 text-center">Avatar</TableHead>
            {/* <TableHead className="p-0 text-center">排名</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {transitionsNearbyUsers((styles, user, state, index) => (
            <animated.tr
              // key={user.uid}
              className="grid grid-cols-3  absolute w-full  border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              style={{
                zIndex: 5 - index,
                willChange: "transform, height, opacity",
                ...styles,
              }}
            >
              <TableCell className="">{user.totalScore}</TableCell>
              <TableCell className="">{user.displayName}</TableCell>
              <TableCell className="flex place-content-center">
                <Thumbnail svg={user?.thumbnail} />
              </TableCell>
              {/* <TableCell className="font-bold text-xl ">
                {userIndex + 1}
              </TableCell> */}
            </animated.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default PersonalInfo;
