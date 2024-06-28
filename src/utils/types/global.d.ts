declare module "*.md";

export type User = {
  createdAt: number;
  displayName: string;
  email: string;
  // dislikedProblems: [];
  // likedProblems: [];
  // solvedProblems: [];
  // starredProblems: [];
  totalScore: number;
  uid: number;
  updatedAt: number;
  thumbnail: string;
  thumbnail_64px: string;
};

export type AuthModal = {
  type: "login" | "register" | "forgotPassword";
  isOpen: boolean;
};
