import { Submission } from "./testCase";

type Message = {
  code: string;
  created_at: number;
  id: string;
  role: "user" | "assistant";
  text: string;
  result?: Submission[];
  type: string;
  isLiked?: number;
};

export { Message, Result };
