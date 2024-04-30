"use client";

import { RecoilRoot } from "recoil";
import { ReactNode } from "react";

const RecoilRootProvider = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

export default RecoilRootProvider;
