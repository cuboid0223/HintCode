import { auth } from "@/firebase/firebase";
import React from "react";
import { useSignOut } from "react-firebase-hooks/auth";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const [signOut, loading, error] = useSignOut(auth);

  const handleLogout = async () => {
    await fetch("/api/logout");
    signOut();
    router.push("/login");
  };
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <FiLogOut />
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>確定要登出 ?</DialogTitle>
            <Button
              className="bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange"
              onClick={handleLogout}
            >
              登出
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default LogoutButton;
