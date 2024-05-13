import { Problem } from "../types/problem";
import { greetNTimes } from "./greet-n-times";
// import { jumpGame } from "./jump-game";
// import { reverseLinkedList } from "./reverse-linked-list";
// import { search2DMatrix } from "./search-a-2d-matrix";
import { twoSum } from "./two-sum";
// import { validParentheses } from "./valid-parentheses";

interface ProblemMap {
  [key: string]: Problem;
}

export const problems: ProblemMap = {
  "two-sum": twoSum,
  "greet-n-times": greetNTimes,
  //   "reverse-linked-list": reverseLinkedList,
  //   "jump-game": jumpGame,
  //   "search-a-2d-matrix": search2DMatrix,
  //   "valid-parentheses": validParentheses,
};
