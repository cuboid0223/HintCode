import { SubmissionData } from "../utils/types/testcase";
import { atom, selector } from "recoil";

export const submissionsDataState = atom<SubmissionData[]>({
  key: "submissionsDataState", // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
});
