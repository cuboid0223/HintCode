"use client";
import { authModalState } from "@/atoms/authModalAtom";
import AuthModal from "@/components/Modals/AuthModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { AuthModal as AuthModalType } from "../../../types/global";

const AuthPage = () => {
  // const authModal = useRecoilValue(authModalState);
  const [authModal, setAuthModal] = useState<AuthModalType>({
    type: "login",
    isOpen: true,
  });
  // const [user, loading, error] = useAuthState(auth);
  // const [pageLoading, setPageLoading] = useState(true);
  // const router = useRouter();

  // useEffect(() => {
  // if (user) router.push("/");
  //   if (!loading && !user) setPageLoading(false);
  // }, [user, router, loading]);

  // if (pageLoading) return null;

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
