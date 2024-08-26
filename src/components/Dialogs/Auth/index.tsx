import React from "react";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import Signup from "./components/Signup";
import { AuthDialog as AuthDialogType } from "@/types/global";
import { FORGET_PASSWORD, LOGIN, REGISTER } from "@/utils/const";

type AuthDialogProps = {
  authDialog: AuthDialogType;
  setAuthDialog?: React.Dispatch<React.SetStateAction<AuthDialogType>>;
};

const AuthDialog: React.FC<AuthDialogProps> = ({
  authDialog,
  setAuthDialog,
}) => {
  switch (authDialog.type) {
    case LOGIN:
      return <Login setAuthDialog={setAuthDialog} />;
    case REGISTER:
      return <Signup setAuthDialog={setAuthDialog} />;
    case FORGET_PASSWORD:
      return <ResetPassword setAuthDialog={setAuthDialog} />;
    default:
      return null;
  }
};
export default AuthDialog;
