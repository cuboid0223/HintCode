import { SubmissionData } from "../utils/types/testcase";
import { atom, selector } from "recoil";

export type SubmissionsDataState = {
  problemId: string;
  submissions: SubmissionData[];
};

export const submissionsDataState = atom<SubmissionsDataState>({
  key: "submissionsDataState", // unique ID (with respect to other atoms/selectors)
  default: {
    problemId: "",
    submissions: [],
  }, // default value (aka initial value)
});
