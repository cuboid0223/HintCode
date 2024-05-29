declare module "*.md";

export type User = {
  createdAt: number;
  dislikedProblems: [];
  displayName: string;
  email: string;
  likedProblems: [];
  solvedProblems: [];
  starredProblems: [];
  totalScore: number;
  uid: number;
  updatedAt: number;
  thumbnail: string;
};
