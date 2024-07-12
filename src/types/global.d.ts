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
  unit: string;
};

export type AuthModal = {
  type: "login" | "register" | "forgotPassword";
  isOpen: boolean;
};
