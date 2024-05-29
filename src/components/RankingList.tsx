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
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useTheme } from "next-themes";

const Trophy = dynamic(
  () => import("@/components/canvas/Models").then((mod) => mod.Trophy),
  { ssr: false }
);

const CustomText3D = dynamic(
  () => import("@/components/canvas/Models").then((mod) => mod.CustomText3D),
  {
    ssr: false,
  }
);

const View = dynamic(
  () => import("@/components/canvas/View").then((mod) => mod.View),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full flex-col items-center justify-center">
        <svg
          className="-ml-1 mr-3 size-5 animate-spin text-black"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    ),
  }
);
const Common = dynamic(
  () => import("@/components/canvas/View").then((mod) => mod.Common),
  { ssr: false }
);

function RankingList() {
  const [top10UsersData, setTop10UsersData] = useState<User[]>([]);
  const { resolvedTheme } = useTheme();
  //   const handleRanking = () => {
  //     const rankedUsers = users.sort((a, b) => b.totalScore - a.totalScore);
  //     // 取前10名
  //     const top10 = rankedUsers.slice(0, 10);

  //     // 分成兩個陣列：前五名和第六到第十名
  //     const top5 = top10.slice(0, 5);
  //     const second5 = top10.slice(5, 10);
  //     setRankingList({ top5, second5 });
  //     return { top5, second5 };
  //   };
  const getTop10UsersData = async () => {
    // 按 score 降序排序並限制結果數量為 10
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, orderBy("totalScore", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    // 如果獲取到的用戶數少於 10，使用 mock data 補足
    if (usersList.length < 10) {
      const additionalUsers = mockUsersData.slice(0, 10 - usersList.length);
      setTop10UsersData([...usersList, ...additionalUsers]);
    } else {
      setTop10UsersData(usersList);
    }
  };

  useEffect(() => {
    getTop10UsersData();
  }, []);

  return (
    <div className="flex items-center">
      <Table className="flex-none text-center">
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader className="">
          <TableRow className="">
            <TableHead className="p-0 text-center">總分</TableHead>
            <TableHead className="p-0 text-center">名字</TableHead>
            <TableHead className="p-0 text-center">Avatar</TableHead>
            <TableHead className="p-0 text-center w-[100px]">排名</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top10UsersData.slice(0, 5).map((user, id) => (
            <TableRow key={user.uid}>
              <TableCell className="">{user.totalScore}</TableCell>
              <TableCell className="">{user.displayName}</TableCell>
              <TableCell className="flex place-content-center">
                <div
                  className="rounded-full"
                  dangerouslySetInnerHTML={{
                    __html:
                      user?.thumbnail || "<div className='h-8 w-8'></div>",
                  }}
                ></div>
              </TableCell>
              <TableCell className="font-bold text-xl">{id + 1}</TableCell>
              {/* <TableCell className="text-right">{user.totalAmount}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="h-40 w-[700px]">
        <View orbit className="relative h-full sm:h-48 sm:w-full">
          <Suspense fallback={null}>
            <Trophy
              scale={1}
              position={[0, -1.6, 0]}
              rotation={[0.0, -0.3, 0]}
            />
            <Common color={resolvedTheme === "dark" ? "#030711" : "#f6f6f6"} />
          </Suspense>
        </View>
      </div>
      <Table className="flex-none text-center">
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="p-0 text-center w-[100px]">排名</TableHead>
            <TableHead className="p-0 text-center">Avatar</TableHead>
            <TableHead className="p-0 text-center">名字</TableHead>
            <TableHead className="p-0 text-center">總分</TableHead>
            {/* <TableHead className="text-right">Amount</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {top10UsersData.slice(5, 10).map((user, id) => (
            <TableRow key={user.uid}>
              <TableCell className="font-bold text-xl">{id + 6}</TableCell>
              <TableCell>
                <div
                  className="flex place-content-center"
                  dangerouslySetInnerHTML={{
                    __html: user?.thumbnail || "",
                  }}
                ></div>
              </TableCell>
              <TableCell className="font-medium">{user.displayName}</TableCell>
              <TableCell>{user.totalScore}</TableCell>
              {/* <TableCell className="text-right">{user.totalAmount}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default RankingList;
