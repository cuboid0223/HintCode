import React from "react";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import Signup from "./components/Signup";
import { AuthDialog as AuthDialogType } from "@/types/global";

type AuthDialogProps = {
  authDialog: AuthDialogType;
  setAuthDialog?: React.Dispatch<React.SetStateAction<AuthDialogType>>;
};

const AuthDialog: React.FC<AuthDialogProps> = ({
  authDialog,
  setAuthDialog,
}) => {
  switch (authDialog.type) {
    case "login":
      return <Login setAuthDialog={setAuthDialog} />;
    case "register":
      return <Signup setAuthDialog={setAuthDialog} />;
    case "forgotPassword":
      return <ResetPassword setAuthDialog={setAuthDialog} />;
    default:
      return null;
  }
};
export default AuthDialog;
