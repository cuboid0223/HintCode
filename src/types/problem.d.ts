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
  title: string;
  problemStatement: string;
  examples: Example[];
  order: number;
  totalTimes: number; // 請求 GPT 幫助的最高次數 預設是 20 次
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
  testCaseCode: TestCase[]; // *** 這個未來需要移除，因為支援多語言了...
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
  behaviors: number[];
};

export type Difficulty = "Easy" | "Medium" | "Hard";
