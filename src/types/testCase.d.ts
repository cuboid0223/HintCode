export type Submission = {
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

export type TestCase = {
  id: string;
  inputCode: string;
  output: string;
};
