import { atom } from "recoil";

export type BehaviorsState = string[];

export const behaviorsState = atom<BehaviorsState>({
  key: "behaviorsState",
  default: [],
});
