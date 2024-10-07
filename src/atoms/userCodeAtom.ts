import { atom } from "recoil";

export const userCodeState = atom<string>({
  key: "userCodeState",
  default: "",
});
