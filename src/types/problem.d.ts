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
  difficulty: Difficulty;
  // likes: number;
  // dislikes: number;
  title: string;
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
  // testCaseCode: TestCase[];
  testCode: {
    py: TestCase[];
    vb: TestCase[];
    [key: string]: TestCase[];
  };
  isPublished: boolean;
  isHelpEnabled: boolean;
  isLocked: boolean;
};

// user -> problem
export type UserProblem = {
  id: string;
  threadId: string;
  acceptedTime: number;
  remainTimes: number;
  is_solved: boolean;
  isLocked: boolean;
  behaviors: string[];
};

export type Difficulty = "Easy" | "Medium" | "Hard";
