import { SubmissionData } from "./types/testcase";

const isAllTestCasesAccepted = (submissions: SubmissionData[]) => {
  if (submissions.length === 0) {
    // console.log("no submissions data for accepted");
    return false;
  }
  return submissions.every(
    // 全部測資都通過 isAllTestCasesAccepted 才會是 true
    (submission) => submission?.status.id === 3
  );
};

export default isAllTestCasesAccepted;
