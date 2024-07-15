"use client";
import AuthDialog from "@/components/Dialogs/Auth";
import TopBar from "@/components/Topbar";
import { AuthDialog as AuthDialogType } from "../../types/global";
import { useState } from "react";

const AuthPage = () => {
  const [authDialog, setAuthDialog] = useState<AuthDialogType>({
    type: "login",
    isOpen: true,
  });

  return (
    <main className="h-screen dark:bg-gradient-to-b from-gray-600 to-black relative">
      <TopBar />
      <section className="h-full container max-w-xl ">
        {authDialog.isOpen && (
          <AuthDialog setAuthDialog={setAuthDialog} authDialog={authDialog} />
        )}
      </section>
    </main>
  );
};
export default AuthPage;
