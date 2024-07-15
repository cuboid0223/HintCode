import { atom } from "recoil";

type AuthDialogState = {
  isOpen: boolean;
  type: "login" | "register" | "forgotPassword";
};

const initialAuthDialogState: AuthDialogState = {
  isOpen: true,
  type: "login",
};

export const authDialogState = atom<AuthDialogState>({
  key: "authDialogState",
  default: initialAuthDialogState,
});
