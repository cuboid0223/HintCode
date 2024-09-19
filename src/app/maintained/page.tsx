import React from "react";
import { Orbitron } from "next/font/google";
import TopBar from "@/components/Topbar";
import { NextFont } from "next/dist/compiled/@next/font";

const orbitron: NextFont = Orbitron({
  weight: "600",
  subsets: ["latin"],
});

export default function Page() {
  return (
    <main className="h-screen flex flex-col">
      <TopBar />
      <section className="flex-grow flex justify-center items-center h-full">
        <h1 className={`${orbitron.className} text-2xl`}>
          System maintenance in progress
        </h1>
      </section>
    </main>
  );
}
