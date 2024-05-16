import { TestCaseCode } from "./testcase";

export type Example = {
  id: number;
  inputText: string;
  outputText: string;
  explanation?: string;
  img?: string;
};

// local problem data
export type Problem = {
  id: string;
  title: string;
  diffmode: string;
  problemStatement: string;
  examples: Example[];
  // constraints: string;
  order: number;
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
};

export type DBProblem = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  likes: number;
  dislikes: number;
  order: number;
  videoId?: string;
  link?: string;
};
