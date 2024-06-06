"use client";

import { Text, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Line, useCursor, MeshDistortMaterial } from "@react-three/drei";
import { AsciiRenderer } from "@react-three/drei";

export function Trophy(props) {
  const { scene } = useGLTF("/trophy.glb");
  const viewport = useThree((state) => state.viewport);
  useFrame((state, delta) => (scene.rotation.y += delta / 5));
  return (
    <>
      <primitive
        object={scene}
        scale={Math.min(viewport.width, viewport.height) / 5}
        {...props}
      />
      {/* <AsciiRenderer fgColor="white" bgColor="transparent" /> */}
    </>
  );
}

export function StrokeText3D({ text }) {
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
        {text}
      </Text>
    </>
  );
}
