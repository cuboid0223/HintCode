"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { User } from "../../types/global";
import { mockUsersData } from "@/mockData/mockUsersData";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useTheme } from "next-themes";
import { View } from "@/components/canvas/View";
import { animated } from "react-spring";
import Avatar from "@/components/Avatar";
import { useUserTransitions } from "@/hooks/useUsers";

const Trophy = dynamic(
  () => import("@/components/canvas/Models").then((mod) => mod.Trophy),
  { ssr: false }
);

const Common = dynamic(
  () => import("@/components/canvas/Commons").then((mod) => mod.Common),
  { ssr: false }
);
const RANKING_LIST_MAX_NUMBER = 10;

function RankingList() {
  const [top10UsersData, setTop10UsersData] = useState<User[]>([]);
  const { resolvedTheme } = useTheme();

  const transitionsTop5 = useUserTransitions(
    top10UsersData,
    0,
    RANKING_LIST_MAX_NUMBER / 2
  );
  const transitionsTop6_10 = useUserTransitions(
    top10UsersData,
    RANKING_LIST_MAX_NUMBER / 2,
    RANKING_LIST_MAX_NUMBER
  );

  useEffect(() => {
    const fillWithMockUsers = (users, minNumber: number) => {
      if (users.length < minNumber) {
        const additionalUsers = mockUsersData.slice(
          0,
          RANKING_LIST_MAX_NUMBER / 2 - users.length
        );
        return [...users, ...additionalUsers];
      } else {
        return users;
      }
    };

    const fetchTop10UsersData = async () => {
      // 按 完成率 降序排序並限制結果數量為 RANKING_LIST_LIMIT
      const usersRef = collection(firestore, "users");
      const q = query(
        usersRef,
        orderBy("completionRate", "desc"),
        limit(RANKING_LIST_MAX_NUMBER)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersList = [];
        querySnapshot.forEach((doc) => {
          // height for row change animation
          usersList.push(doc.data() as User);
        });

        // 如果獲取到的用戶數少於 RANKING_LIST_MAX_NUMBER，使用 mock data 補足
        setTop10UsersData(
          fillWithMockUsers(usersList, RANKING_LIST_MAX_NUMBER)
        );
      });
    };
    fetchTop10UsersData();
  }, []);

  return (
    <div className="grid  md:grid-cols-3 md:grid-rows-1 h-full mt-5 container">
      {/* 1 - 5 名的 table */}
      <Table className="h-full text-center ">
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
              <TableCell className="font-['Orbitron'] order-4 md:order-none">
                {user.completionRate.toFixed(1)}%
              </TableCell>
              <TableCell className="order-3 md:order-none">
                {user.displayName}
              </TableCell>
              <TableCell className="flex place-content-center  order-2 md:order-none">
                <Avatar svg={user?.thumbnail} />
              </TableCell>
              <TableCell className="font-['Orbitron']">{index + 1}</TableCell>
            </animated.tr>
          ))}
        </TableBody>
      </Table>
      {/* 3D 獎盃 */}
      <section className="hidden md:block">
        <View orbit className="relative h-[400px] ">
          <Suspense fallback={null}>
            <Trophy
              scale={0.75}
              position={[0, -1.6, 0]}
              rotation={[0.0, 10, 0]}
            />

            <Common color={resolvedTheme === "dark" ? "#030711" : "#f6f6f6"} />
          </Suspense>
        </View>
      </section>
      {/* 6 - 10 名的 table */}
      <Table className="h-full text-center ">
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
              <TableCell className={`order-4 font-['Orbitron']`}>
                {user.completionRate.toFixed(1)}%
              </TableCell>
              <TableCell className="order-3">{user.displayName}</TableCell>
              <TableCell className="flex place-content-center order-2">
                <Avatar svg={user?.thumbnail} />
              </TableCell>
              <TableCell className="font-['Orbitron']">{index + 6}</TableCell>
            </animated.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default RankingList;
