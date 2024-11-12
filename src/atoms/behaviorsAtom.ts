import { atom } from "recoil";

export type BehaviorsState = number[];

export const behaviorsState = atom<BehaviorsState>({
  key: "behaviorsState",
  default: [],
});
