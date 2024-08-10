import { Submission } from "../../types/testCase";
import { ACCEPTED_STATUS_ID } from "../const";

const isAllTestCasesAccepted = (submissions: Submission[]): boolean => {
  if (!submissions || submissions?.length === 0) {
    // console.log("no submissions data for accepted");
    return false;
  }
  return submissions.every(
    // 全部測資都通過 isAllTestCasesAccepted 才會是 true
    (submission) => submission?.status.id === ACCEPTED_STATUS_ID
  );
};

export default isAllTestCasesAccepted;
