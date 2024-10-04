import { Submission } from "./testCase";
import { z } from "zod";

type Message = {
  code: string;
  created_at: number;
  id: string;
  role: "user" | "assistant";
  text?: string;
  result?: Submission[];
  type?: string;
  isLiked?: number;
};

export { Message };
