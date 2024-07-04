"use client";
import useGetUserInfo, { useGetSubscribedUser } from "@/hooks/useGetUserInfo";
import React, { useEffect, useRef, useState } from "react";
import { animated } from "react-spring";
import Thumbnail from "./Thumbnail";
import useGetUsers, {
  useGetSubscribedUsers,
  useUserTransitions,
} from "@/hooks/useUsers";
import { User } from "@/utils/types/global";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CountUp, { useCountUp } from "react-countup";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import {
  submissionsDataState,
  SubmissionsDataState,
} from "@/atoms/submissionsDataAtom";
import { useRecoilState } from "recoil";

function PersonalInfo() {
  const targetUser = useGetUserInfo();
  const currentUser = useGetSubscribedUser();
  const [{ submissions }, setSubmissionsData] =
    useRecoilState<SubmissionsDataState>(submissionsDataState);
  const users = useGetUsers();
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const transitionsNearbyUsers = useUserTransitions(nearbyUsers);

  useEffect(() => {
    const findUserIndex = (users: User[], target: User) => {
      if (users.length === 0 || !target) return;
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

    setNearbyUsers(findNearbyUsers(users, targetUser));
    setUserIndex(findUserIndex(users, targetUser));
  }, [users, targetUser]);

  useEffect(() => {
    if (!targetUser) return;

    setNearbyUsers((prevNearbyUsers) => {
      const updatedUsers = prevNearbyUsers.map((user) =>
        user.uid === targetUser.uid
          ? { ...user, totalScore: currentUser.totalScore }
          : user
      );

      return updatedUsers.sort((a, b) => b.totalScore - a.totalScore);
    });
  }, [currentUser?.totalScore, targetUser]);

  return (
    <div className="flex">
      <section className="p-2">
        <Thumbnail svg={targetUser?.thumbnail_64px} />

        {/* score */}
        <pre>總分: </pre>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          <CountUp
            start={targetUser?.totalScore}
            end={currentUser?.totalScore}
            duration={1}
            separator=" "
            // decimals={4}
            // decimal=","
            // prefix="EUR "
            // suffix=" left"
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
            <TableHead className="p-0 text-center">總分</TableHead>
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
