"use client";
import AuthModal from "@/components/Modals/Auth";
import Topbar from "@/components/Topbar";
import { AuthModal as AuthModalType } from "../../types/global";
import { useState } from "react";

const AuthPage = () => {
  const [authModal, setAuthModal] = useState<AuthModalType>({
    type: "login",
    isOpen: true,
  });

  return (
    <main className="h-screen dark:bg-gradient-to-b from-gray-600 to-black relative">
      <Topbar authModal={authModal} setAuthModal={setAuthModal} />
      <section className="h-full container max-w-xl ">
        {authModal.isOpen && (
          <AuthModal setAuthModal={setAuthModal} authModal={authModal} />
        )}
      </section>
    </main>
  );
};
export default AuthPage;
