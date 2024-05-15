"use client";
import { Problem } from "../types/problem";

import greetNTimesDescription from "./description/greet-n-times.md";

const starterCode_py = `def greetNTimes(num):
  # Write your code here
`;

const starterCode_js = `function greetNTimes(num){
 // Write your code here

}
`;

const starterFunctionName_py = "def greetNTimes(";
const starterFunctionName_js = "function greetNTimes(";

const case1InputCode = `
num = 2

greetNTimes(num)`;
const case1Output = "Hello World\nHello World\n";

const case2InputCode = `num = 5

greetNTimes(num)`;
const case2Output =
  "Hello World\nHello World\nHello World\nHello World\nHello World\n";

const case3InputCode = `num = 0

greetNTimes(num)`;
const case3Output = "NCHU\n";

// checks if the user has the correct code
// const handlerTwoSum = (fn: any) => {
//   // fn is the callback that user's code is passed into
//   try {
//     const nums = [
//       [2, 7, 11, 15],
//       [3, 2, 4],
//       [3, 3],
//     ];

//     const targets = [9, 6, 6];
//     const answers = [
//       [0, 1],
//       [1, 2],
//       [0, 1],
//     ];

//     // loop all tests to check if the user's code is correct
//     for (let i = 0; i < nums.length; i++) {
//       // result is the output of the user's function and answer is the expected output
//       const result = fn(nums[i], targets[i]);
//       assert.deepStrictEqual(result, answers[i]);
//     }
//     return true;
//   } catch (error: any) {
//     console.log("twoSum handler function error");
//     throw new Error(error);
//   }
// };

export const greetNTimes: Problem = {
  id: "greet-n-times",
  title: "0. Greet N Times",
  problemStatement: greetNTimesDescription,
  examples: [
    {
      id: 1,
      inputText: "num = 2",
      outputText: "Hello World\nHello World\n",
      explanation: "因為 num = 2, 所以我們印出 2 次 `Hello World`",
    },
    {
      id: 2,
      inputText: "num = 5",
      outputText:
        "Hello World\nHello World\nHello World\nHello World\nHello World\n",
      explanation: "因為 num = 5, 所以我們印出 5 次 `Hello World`",
    },
    {
      id: 3,
      inputText: "num = 0",
      outputText: "NCHU",
      explanation: "如果 num = 0, 所以我們印出 `NCHU`",
    },
  ],
  //   handlerFunction: handlerTwoSum,
  starterCode: {
    py: starterCode_py,
    js: starterCode_js,
  },
  order: 2,
  starterFunctionName: {
    py: starterFunctionName_py,
    js: starterFunctionName_js,
  },
  testCaseCode: [
    {
      id: "1",
      inputCode: case1InputCode,
      output: case1Output,
    },
    {
      id: "2",
      inputCode: case2InputCode,
      output: case2Output,
    },
    {
      id: "3",
      inputCode: case3InputCode,
      output: case3Output,
    },
  ],
};
