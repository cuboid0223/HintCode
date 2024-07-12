import { Submission } from "../types/testCase";
import { atom } from "recoil";

export type SubmissionsState = Submission[];

export const submissionsState = atom<SubmissionsState>({
  key: "submissionsState", // unique ID (with respect to other atoms/selectors)
  default: [],
});
