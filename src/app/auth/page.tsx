"use client";
import { authModalState } from "@/atoms/authModalAtom";
import AuthModal from "@/components/Modals/AuthModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar/Topbar";
import { AuthModal as AuthModalType } from "@/utils/types/global";

const AuthPage = () => {
  // const authModal = useRecoilValue(authModalState);
  const [authModal, setAuthModal] = useState<AuthModalType>({
    type: "login",
    isOpen: false,
  });
  const [user, loading, error] = useAuthState(auth);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
    if (!loading && !user) setPageLoading(false);
  }, [user, router, loading]);

  if (pageLoading) return null;

  return (
    <div className="bg-gradient-to-b from-gray-600 to-black h-screen relative">
      <div className="max-w-7xl mx-auto">
        <Topbar setAuthModal={setAuthModal} />

        {authModal.isOpen && (
          <AuthModal setAuthModal={setAuthModal} authModal={authModal} />
        )}
      </div>
    </div>
  );
};
export default AuthPage;
