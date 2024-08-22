import TopBar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import React from "react";
import GoBackButton from "./components/GoBackButton";

function page({ searchParams }) {
  return (
    <div className="h-screen overflow-hidden">
      <TopBar />
      <section className="flex bg-blue-300 items-center flex-col place-content-center h-full">
        <h1 className="text-2xl flex flex-col text-center">
          {`${searchParams.pid} 已被鎖定`}
          <p>請先完成上一道題目</p>
        </h1>

        <GoBackButton />
      </section>
    </div>
  );
}

export default page;
