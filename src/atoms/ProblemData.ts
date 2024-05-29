import { Problem } from "@/utils/types/problem";
import { atom } from "recoil";

type ProblemDataState = Problem | null;

export const problemDataState = atom<ProblemDataState>({
  key: "problemDataState",
  default: null,
});
