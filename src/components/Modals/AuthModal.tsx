import { authModalState } from "@/atoms/authModalAtom";
import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Signup from "./Signup";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { AuthModal as AuthModalType } from "@/utils/types/global";

type AuthModalProps = {
  authModal: AuthModalType;
  setAuthModal?: React.Dispatch<React.SetStateAction<AuthModalType>>;
};

const AuthModal: React.FC<AuthModalProps> = ({ authModal, setAuthModal }) => {
  // const closeModal = useCloseModal();

  switch (authModal.type) {
    case "login":
      return <Login setAuthModal={setAuthModal} />;
    case "register":
      return <Signup setAuthModal={setAuthModal} />;
    case "forgotPassword":
      return <ResetPassword />;
    default:
      return null;
  }
};
export default AuthModal;

// function useCloseModal() {
//   const setAuthModal = useSetRecoilState(authModalState);

//   const closeModal = () => {
//     setAuthModal((prev) => ({ ...prev, isOpen: false, type: "login" }));
//   };

//   useEffect(() => {
//     const handleEsc = (e: KeyboardEvent) => {
//       if (e.key === "Escape") closeModal();
//     };
//     window.addEventListener("keydown", handleEsc);
//     return () => window.removeEventListener("keydown", handleEsc);
//   }, []);

//   return closeModal;
// }
