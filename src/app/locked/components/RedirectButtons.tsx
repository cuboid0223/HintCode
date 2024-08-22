"use client"; // 告訴 Next.js 這是一個 Client Component
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";
import { redirect } from "next/navigation";

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
      <Button onClick={handleGoBack}>上一頁</Button>
      <Button onClick={handleGoHomePage}>回到問題列表</Button>
    </div>
  );
}
