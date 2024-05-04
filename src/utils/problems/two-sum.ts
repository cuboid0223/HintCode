import assert from "assert";
import { Problem } from "../types/problem";

import twoSumDescription from "./description/two-sum.md";

const starterCode_py = `def twoSum(nums,target):
  # Write your code here
`;

const starterCode_js = `function twoSum(nums,target){
 // Write your code here
	for(let x=0;x<nums.length;x++){
		let goal=target-nums[x];
		for(let y=x+1;y<=nums.length;y++){
			if(nums[y]===goal)
				return [x,y];
		}
}
}
`;

const starterFunctionName_py = "def twoSum(";
const starterFunctionName_js = "function twoSum(";

const case1InputCode = `nums = [2,7,11,15]
target = 9

twoSum(nums, target)`;
const case1Output = "[0, 1]\n";

const case2InputCode = `nums = [3,2,4]
target = 6

twoSum(nums, target)`;
const case2Output = "[1, 2]\n";

const case3InputCode = `nums = [3,3]
target = 6

twoSum(nums, target)`;
const case3Output = "[0, 1]\n";

// checks if the user has the correct code
const handlerTwoSum = (fn: any) => {
  // fn is the callback that user's code is passed into
  try {
    const nums = [
      [2, 7, 11, 15],
      [3, 2, 4],
      [3, 3],
    ];

    const targets = [9, 6, 6];
    const answers = [
      [0, 1],
      [1, 2],
      [0, 1],
    ];

    // loop all tests to check if the user's code is correct
    for (let i = 0; i < nums.length; i++) {
      // result is the output of the user's function and answer is the expected output
      const result = fn(nums[i], targets[i]);
      assert.deepStrictEqual(result, answers[i]);
    }
    return true;
  } catch (error: any) {
    console.log("twoSum handler function error");
    throw new Error(error);
  }
};

export const twoSum: Problem = {
  id: "two-sum",
  title: "1. Two Sum",
  problemStatement: twoSumDescription,
  examples: [
    {
      id: 1,
      inputText: "nums = [2,7,11,15], target = 9",
      outputText: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      id: 2,
      inputText: "nums = [3,2,4], target = 6",
      outputText: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
    {
      id: 3,
      inputText: " nums = [3,3], target = 6",
      outputText: "[0,1]",
    },
  ],
  handlerFunction: handlerTwoSum,
  starterCode: {
    py: starterCode_py,
    js: starterCode_js,
  },
  order: 1,
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
