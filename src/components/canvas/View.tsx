"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { OrbitControls, View as ViewImpl } from "@react-three/drei";
import { Three } from "@/providers/ThreeProvider";

type ViewProps = {
  children: React.ReactNode;
  orbit?: boolean;
  className?: string;
};

const View: React.FC<ViewProps> = forwardRef(
  ({ children, orbit, ...props }, ref) => {
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
  }
);
View.displayName = "View";

export { View };
