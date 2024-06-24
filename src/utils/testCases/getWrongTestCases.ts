import { SubmissionData } from "../types/testCase";

const getWrongTestCases = (submissions: SubmissionData[]) => {
  // 取得 submissionsData 陣列中 data.status.id 不為 3 換句話講就是 wrong answer 的 submission
  if (submissions.length === 0) return;
  return submissions.filter((obj) => {
    return obj.status.id !== 3;
  });
};

export default getWrongTestCases;
