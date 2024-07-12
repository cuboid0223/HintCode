import React from "react";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import Signup from "./components/Signup";
import { AuthModal as AuthModalType } from "@/types/global";

type AuthModalProps = {
  authModal: AuthModalType;
  setAuthModal?: React.Dispatch<React.SetStateAction<AuthModalType>>;
};

const AuthModal: React.FC<AuthModalProps> = ({ authModal, setAuthModal }) => {
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
