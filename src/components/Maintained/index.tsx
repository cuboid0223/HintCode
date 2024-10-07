import React from "react";
import TopBar from "@/components/Topbar";
import { orbitron600 } from "@/utils/const";

export default async function MaintainedPage() {
  return (
    <main className="h-screen flex flex-col">
      <TopBar />
      <section className="flex-grow flex justify-center items-center h-full">
        <h1 className={`${orbitron600.className} text-2xl`}>
          System maintenance in progress
        </h1>
      </section>
    </main>
  );
}
