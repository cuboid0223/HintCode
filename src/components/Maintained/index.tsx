import React from "react";
import TopBar from "@/components/Topbar";

export default async function MaintainedPage() {
  return (
    <main className="h-screen flex flex-col">
      <TopBar />
      <section className="flex-grow flex justify-center items-center h-full">
        <h1 className={`font-['Orbitron'] font-semibold text-2xl`}>
          System maintenance in progress
        </h1>
      </section>
    </main>
  );
}
