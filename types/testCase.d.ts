export type SubmissionData = {
  memory: number;
  status: {
    description: string;
    id: number;
  };
  stdout: string;
  time: string;
  token: string;
  stderr: string;
  message: string;
  compile_output: string;
};

type TestCase = {
  id: string;
  inputCode: string;
  output: string;
};
export type TestCaseCode = TestCase[];
