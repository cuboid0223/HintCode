"use client";

import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Line, useCursor, MeshDistortMaterial } from "@react-three/drei";

export function Trophy(props) {
  const { scene } = useGLTF("/trophy.glb");
  useFrame((state, delta) => (scene.rotation.y += delta));
  return <primitive object={scene} {...props} />;
}

export function CustomText3D(props) {
  return (
    <>
      <Text
        // color='red'
        fontSize={2}
        maxWidth={23}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign={"left"}
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0}
        strokeWidth={"2.5%"}
        strokeColor="#ffffff"
      >
        Just go ahead and type in whatever comes to mind.
      </Text>
    </>
  );
}
