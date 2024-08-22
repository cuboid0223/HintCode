"use client"; // 告訴 Next.js 這是一個 Client Component
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";

export default function GoBackButton() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // 返回上一頁
  };

  return <Button onClick={handleGoBack}>上一頁</Button>;
}
