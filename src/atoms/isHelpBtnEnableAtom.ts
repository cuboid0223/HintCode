import { atom } from "recoil";

const initialIsHelpBtnEnableState = false;

export const isHelpBtnEnableState = atom({
  key: "isHelpBtnEnableState",
  default: initialIsHelpBtnEnableState,
});
