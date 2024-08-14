import { TestCase } from "./testCase";

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
  // likes: number;
  // dislikes: number;
  title: string;
  // diffmode: string;
  problemStatement: string;
  examples: Example[];
  order: number;
  totalTimes: number;
  starterCode: {
    py: string;
    js: string;
    [key: string]: string;
  };
  starterFunctionName: {
    py: string;
    js: string;
    [key: string]: string;
  };
  testCaseCode: TestCase[];
  score: number;
  isPublished: boolean;
  isHelpEnabled: boolean;
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
