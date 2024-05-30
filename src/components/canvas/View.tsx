"use client";

import { forwardRef, Suspense, useImperativeHandle, useRef } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  View as ViewImpl,
} from "@react-three/drei";
import { Three } from "@/providers/ThreeProvider";

const View = forwardRef(({ children, orbit, ...props }, ref) => {
  const localRef = useRef(null);
  useImperativeHandle(ref, () => localRef.current);

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>
          {children}
          {orbit && <OrbitControls />}
        </ViewImpl>
      </Three>
    </>
  );
});
View.displayName = "View";

export { View };
