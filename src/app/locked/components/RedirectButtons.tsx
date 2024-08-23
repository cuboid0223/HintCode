"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";

export default function RedirectButtons() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // 返回上一頁
  };

  const handleGoHomePage = () => {
    router.push("/");
  };

  return (
    <div className="flex gap-x-3">
      {/* <Button onClick={handleGoBack}>上一頁</Button> */}
      <Button onClick={handleGoHomePage}>回到問題列表</Button>
    </div>
  );
}
