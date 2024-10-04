import React from "react";
import TopBar from "@/components/Topbar";
import { redirect } from "next/navigation";
import { getMaintenanceSettings } from "@/utils/problems/getSettings";
import { orbitron600 } from "@/utils/const";

export default async function MaintainedPage() {
  const isMaintained = await getMaintenanceSettings();

  if (!isMaintained) {
    redirect("/");
  }
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
