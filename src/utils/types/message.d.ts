import { SubmissionsDataState } from "@/atoms/submissionsDataAtom";

type Message = {
  code: string;
  created_at: number;
  id: string;
  role: "user" | "assistant";
  text: string;
  result?: SubmissionsDataState;
};

export { Message, Result };