import { DocumentReference } from "firebase/firestore";

declare module "*.md";

export type ThemeType = "light" | "dark";

export type User = {
  createdAt: number;
  displayName: string;
  email: string;
  completionRate: number;
  uid: number;
  updatedAt: number;
  thumbnail: string;
  thumbnail_64px: string;
  unit: DocumentReference;
  role: string;
};

export type AuthDialog = {
  type: "login" | "register" | "forgotPassword";
  isOpen: boolean;
};

export type Languages = "py" | "js" | "vb";

export type Settings = {
  fontSize: string;
  settingsDialogIsOpen: boolean;
  dropdownIsOpen: boolean;
  selectedLang: Languages;
};

export type DevSettings = {
  isMaintained: boolean;
  showCustomInput: boolean;
};
