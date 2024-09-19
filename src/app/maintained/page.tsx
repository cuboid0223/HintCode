import { firestore } from "@/firebase/firebase";
import { DevSettings } from "@/types/global";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { redirect } from "next/navigation";
import { Orbitron } from "next/font/google";
import TopBar from "@/components/Topbar";
export const orbitron = Orbitron({
  weight: "600",
  subsets: ["latin"],
});
export default async function Page() {
  const settingsRef = doc(firestore, "settings", "data");
  const settingsSnap = await getDoc(settingsRef);
  const settingsData = settingsSnap.data() as DevSettings;
  if (!settingsData.isMaintained) {
    redirect("/auth");
  }
  return (
    <main className="h-screen">
      <TopBar />
      <section className="flex justify-center items-center h-full">
        <h1 className={`${orbitron.className} text-2xl`}>
          System maintenance in progress
        </h1>
      </section>
    </main>
  );
}
