import TopBar from "@/components/Topbar";
import React from "react";
import RedirectButtons from "./components/RedirectButtons";

function page({ searchParams }) {
  return (
    <div className="h-screen overflow-hidden">
      <TopBar />
      <section className="flex  items-center flex-col place-content-center h-full">
        <h1 className="text-2xl flex flex-col text-center">
          {`${searchParams.pid} 已被鎖定`}
          <p>請先完成上一道題目</p>
        </h1>
        <RedirectButtons />
      </section>
    </div>
  );
}

export default page;
