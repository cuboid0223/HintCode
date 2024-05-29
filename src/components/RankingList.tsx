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

function RankingList() {
  const [top10UsersData, setTop10UsersData] = useState<User[]>([]);

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
    <div className="flex">
      <Table>
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>總分</TableHead>
            <TableHead>名字</TableHead>
            <TableHead>Avatar</TableHead>
            <TableHead className="w-[100px]">排名</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top10UsersData.slice(0, 5).map((user, id) => (
            <TableRow key={user.uid}>
              <TableCell>{user.totalScore}</TableCell>
              <TableCell className="font-medium">{user.displayName}</TableCell>
              <TableCell>
                <div
                  className="rounded-full"
                  dangerouslySetInnerHTML={{
                    __html:
                      user?.thumbnail || "<div className='h-8 w-8'></div>",
                  }}
                ></div>
              </TableCell>
              <TableCell className="font-medium">{id + 1}</TableCell>
              {/* <TableCell className="text-right">{user.totalAmount}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="h-24 w-24 bg-red-500">trophy</div>
      <Table>
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">排名</TableHead>
            <TableHead>Avatar</TableHead>
            <TableHead>名字</TableHead>
            <TableHead>總分</TableHead>
            {/* <TableHead className="text-right">Amount</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {top10UsersData.slice(5, 10).map((user, id) => (
            <TableRow key={user.uid}>
              <TableCell className="font-medium">{id + 6}</TableCell>
              <TableCell>
                <div
                  className="rounded-full"
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
