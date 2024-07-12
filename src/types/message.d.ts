import { Submission } from "./testCase";

type Message = {
  code: string;
  created_at: number;
  id: string;
  role: "user" | "assistant";
  text: string;
  submissions?: Submission[];
  type: string;
};

export { Message, Result };
