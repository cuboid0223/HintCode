"use client";

import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";

export const Common = ({ color }) => (
  <Suspense fallback={null}>
    {color && <color attach="background" args={[color]} />}
    <ambientLight />
    <pointLight position={[20, 30, 10]} intensity={10} decay={0.2} />
    <pointLight position={[-10, -10, -10]} color="white" decay={0.2} />
    <PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />
  </Suspense>
);

export const StrokeText3DCommon = ({ color }) => (
  <Suspense fallback={null}>
    {color && <color attach="background" args={[color]} />}
    <ambientLight />
    <pointLight position={[20, 30, 10]} intensity={10} decay={0.2} />
    <pointLight position={[-10, -10, -10]} color="white" decay={0.2} />
    <PerspectiveCamera makeDefault fov={50} position={[-40, 0, 50]} />
  </Suspense>
);
