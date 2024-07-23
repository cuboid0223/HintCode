import { DocumentReference } from "firebase/firestore";

declare module "*.md";

export type ThemeType = "light" | "dark";

export type User = {
  createdAt: number;
  displayName: string;
  email: string;
  totalScore: number;
  uid: number;
  updatedAt: number;
  thumbnail: string;
  thumbnail_64px: string;
  unit: DocumentReference;
};

export type AuthDialog = {
  type: "login" | "register" | "forgotPassword";
  isOpen: boolean;
};
