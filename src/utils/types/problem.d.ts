import { TestCaseCode } from "./testCase";

export type Example = {
  id: number;
  inputText: string;
  outputText: string;
  explanation?: string;
  img?: string;
};

// firestore problem data
export type Problem = {
  id: string;
  category: string;
  difficulty: string;
  likes: number;
  dislikes: number;
  title: string;
  diffmode: string;
  problemStatement: string;
  examples: Example[];
  // constraints: string;
  order: number;
  totalTimes: number;
  starterCode: {
    py: string;
    js: string;
    [key: string]: string;
  };
  // handlerFunction: ((fn: any) => boolean) | string;
  starterFunctionName: {
    py: string;
    js: string;
    [key: string]: string;
  };
  testCaseCode: TestCaseCode;
  score: number;
};

// user -> problem
export type UserProblem = {
  id: string;
  threadId: string;
  acceptedTime: number;
  remainTimes: number;
  score: number;
  is_solved: boolean;
};