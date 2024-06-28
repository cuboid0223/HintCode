"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/utils/types/global";
import { mockUsersData } from "@/mockProblems/mockUsersData";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useTheme } from "next-themes";
import { View } from "./canvas/View";
import { useTransition, animated } from "react-spring";
import Thumbnail from "./Thumbnail";

const Trophy = dynamic(
  () => import("@/components/canvas/Models").then((mod) => mod.Trophy),
  { ssr: false }
);

const Common = dynamic(
  () => import("@/components/canvas/Commons").then((mod) => mod.Common),
  { ssr: false }
);

function RankingList() {
  let heightTop5Accumulator = 0;
  let heightTop6_10Accumulator = 0;
  const [top10UsersData, setTop10UsersData] = useState<User[]>([]);
  const { resolvedTheme } = useTheme();

  const fillWithMockUsers = (users, minNumber: number) => {
    if (users.length < minNumber) {
      const additionalUsers = mockUsersData.slice(0, 10 - users.length);
      setTop10UsersData([...users, ...additionalUsers]);
    } else {
      setTop10UsersData(users);
    }
  };

  const transitionsTop5 = useTransition(
    top10UsersData.slice(0, 5).map((data: any) => ({
      ...data,
      y: (heightTop5Accumulator += data.height) - data.height,
    })),
    {
      keys: (user: any) => user.uid,
      from: { height: 0, opacity: 0 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      leave: { height: 0, opacity: 0 },
      update: ({ y, height }) => ({ y, height }),
    }
  );

  const transitionsTop6_10 = useTransition(
    top10UsersData.slice(5, 10).map((data: any) => ({
      ...data,
      y: (heightTop6_10Accumulator += data.height) - data.height,
    })),
    {
      keys: (user: any) => user.uid,
      from: { height: 0, opacity: 0 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      leave: { height: 0, opacity: 0 },
      update: ({ y, height }) => ({ y, height }),
    }
  );

  useEffect(() => {
    const getTop10UsersData = async () => {
      // 按 score 降序排序並限制結果數量為 10
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, orderBy("totalScore", "desc"), limit(10));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ ...doc.data(), height: 64 });
        });

        // 如果獲取到的用戶數少於 10，使用 mock data 補足
        fillWithMockUsers(usersList, 10);
      });
    };
    getTop10UsersData();
  }, []);

  useEffect(() => {
    console.log("top10UsersData: ", top10UsersData.slice(6, 11));
  }, [top10UsersData]);

  return (
    <div className="grid grid-cols-3 grid-rows-1 min-h-[400px] mt-5">
      {/* 1 - 5 名的 table */}
      <Table className="h-full text-center ">
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader className="">
          <TableRow className="grid grid-cols-4">
            <TableHead className="p-0 text-center">總分</TableHead>
            <TableHead className="p-0 text-center">名字</TableHead>
            <TableHead className="p-0 text-center">Avatar</TableHead>
            <TableHead className="p-0 text-center w-[100px]">排名</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {transitionsTop5((styles, user, state, index) => (
            <animated.tr
              // key={user.uid}
              className="grid grid-cols-4  absolute w-full  border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
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
              <TableCell className="font-bold text-xl ">{index + 1}</TableCell>
            </animated.tr>
          ))}
        </TableBody>
      </Table>
      {/* 3D 獎盃 */}
      <div className="">
        <View orbit className="relative h-full  sm:w-full">
          <Suspense fallback={null}>
            <Trophy
              scale={0.75}
              position={[0, -1.6, 0]}
              rotation={[0.0, 10, 0]}
            />

            <Common color={resolvedTheme === "dark" ? "#030711" : "#f6f6f6"} />
          </Suspense>
        </View>
      </div>
      {/* 6 - 10 名的 table */}
      <Table className="h-full text-center ">
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader className="">
          <TableRow className="grid grid-cols-4">
            <TableHead className="p-0 text-center order-4">總分</TableHead>
            <TableHead className="p-0 text-center order-3">名字</TableHead>
            <TableHead className="p-0 text-center order-2">Avatar</TableHead>
            <TableHead className="p-0 text-center w-[100px] order-1">
              排名
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {transitionsTop6_10((styles, user, state, index) => (
            <animated.tr
              // key={user.uid}
              className="grid grid-cols-4  absolute w-full  border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              style={{
                zIndex: 5 - index,
                willChange: "transform, height, opacity",
                ...styles,
              }}
            >
              <TableCell className="order-4">{user.totalScore}</TableCell>
              <TableCell className="order-3">{user.displayName}</TableCell>
              <TableCell className="flex place-content-center order-2">
                <div
                  className="rounded-full h-8 w-8"
                  dangerouslySetInnerHTML={{
                    __html: user.thumbnail || "<div className='h-8 w-8'></div>",
                  }}
                ></div>
              </TableCell>
              <TableCell className="font-bold text-xl order-1">
                {index + 6}
              </TableCell>
            </animated.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default RankingList;
