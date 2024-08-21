// "use client";
// import React, { useRef, useState, useEffect } from "react";
// import { Canvas, useFrame, useThree, Vector3 } from "@react-three/fiber";
// import {
//   OrbitControls,
//   OrthographicCamera,
//   PerspectiveCamera,
//   Grid,
//   Sphere,
//   GizmoHelper,
//   GizmoViewport,
//   Center,
//   Environment,
// } from "@react-three/drei";
// import * as THREE from "three";
// import { Group, Mesh } from "three";
// import { useControls } from "leva";
// interface LevelInfo {
//   info: string;
//   position: Vector3;
// }

// interface LevelPointProps {
//   position: Vector3;
//   info: string;
// }

// const LevelPoint: React.FC<LevelPointProps> = ({ position, info }) => {
//   const [hovered, setHovered] = useState(false);
//   const sphereRef = useRef<Mesh>(null);
//   useFrame(({ clock }) => {
//     const time = clock.getElapsedTime();
//     if (sphereRef.current) {
//       sphereRef.current.rotation.y = (time / 2) % (2 * Math.PI);
//     }
//   });
//   return (
//     // <mesh
//     //   position={position}
//     //   rotation={[Math.PI / 2, 0, 0]} // 圍繞 x 軸旋轉 90 度
//     //   onPointerOver={() => setHovered(true)}
//     //   onPointerOut={() => setHovered(false)}
//     // >
//     //   <circleGeometry args={[0.5, 32]} />
//     //   <meshBasicMaterial color={hovered ? "hotpink" : "orange"} />
//     //   {hovered && (
//     //     <sprite position={[0, 1, 0]}>
//     //       <spriteMaterial attach="material">
//     //         <canvasTexture attach="map" image={getTextCanvas(info)} />
//     //       </spriteMaterial>
//     //     </sprite>
//     //   )}
//     // </mesh>
//     <Sphere
//       ref={sphereRef}
//       args={[2, 16, 8]}
//       position={position}
//       rotation={[0, 0, 0]}
//     >
//       <meshStandardMaterial wireframe color="orange" />
//     </Sphere>
//   );
// };

// interface SceneProps {
//   levels: LevelInfo[];
// }

// const Scene: React.FC<SceneProps> = ({ levels }) => {
//   const cameraRef = useRef<THREE.OrthographicCamera>(null);
//   const { camera, size } = useThree();
//   const { gridSize, ...gridConfig } = useControls({
//     gridSize: [10.5, 10.5],
//     cellSize: { value: 0.6, min: 0, max: 10, step: 0.1 },
//     cellThickness: { value: 1, min: 0, max: 5, step: 0.1 },
//     cellColor: "#6f6f6f",
//     sectionSize: { value: 3.3, min: 0, max: 10, step: 0.1 },
//     sectionThickness: { value: 1.5, min: 0, max: 5, step: 0.1 },
//     sectionColor: "#9d4b4b",
//     fadeDistance: { value: 25, min: 0, max: 100, step: 1 },
//     fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
//     followCamera: false,
//     infiniteGrid: true,
//   });
//   useFrame(({ mouse }) => {
//     if (cameraRef.current) {
//       cameraRef.current.position.x +=
//         (mouse.x * 5 - cameraRef.current.position.x) * 0.05;
//     }
//   });

//   const handleKeyDown = (event: KeyboardEvent) => {
//     if (event.key === "ArrowLeft") {
//       camera.position.x -= 1;
//     } else if (event.key === "ArrowRight") {
//       camera.position.x += 1;
//     }
//   };

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   return (
//     <>
//       <color attach="background" args={["#050505"]} />
//       <ambientLight />
//       <directionalLight position={[10, 100, 5]} intensity={2} castShadow />
//       {/* <PerspectiveCamera makeDefault position={[0, 10, 20]} /> */}
//       <OrthographicCamera makeDefault position={[20, 15, 20]} zoom={7} />
//       {/* <OrbitControls
//         enablePan={false}
//         minZoom={4}
//         maxZoom={15}
//         enableZoom={true}
//         enableRotate={true}
//       /> */}
//       <OrbitControls makeDefault />
//       <Center top>
//         {levels.map((level, index) => (
//           <LevelPoint key={index} position={level.position} info={level.info} />
//         ))}
//       </Center>

//       <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />

//       <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
//         <GizmoViewport
//           axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
//           labelColor="white"
//         />
//       </GizmoHelper>
//     </>
//   );
// };

// const Page: React.FC = () => {
//   const levels: LevelInfo[] = [
//     { info: "第一關", position: [0, 0, 0] },
//     { info: "第二關", position: [5, 0, -1] },
//     { info: "第三關", position: [33, 0, -1] },
//     { info: "第四關", position: [22, 0, 4] },
//     { info: "第五關", position: [-10, 0, 4] },
//     { info: "第六關", position: [80, 0, -9] },
//     { info: "第七關", position: [10, 0, -22] },
//     { info: "第八關", position: [20, 0, -2] },
//     { info: "第九關", position: [40, 0, 3] },
//     { info: "第十關", position: [10, 0, 0] },
//   ];

//   return (
//     <Canvas
//       flat
//       shadows
//       dpr={[1, 1.5]}
//       gl={{ antialias: false }}
//       // style={{ background: "#1a1a1a" }}
//     >
//       <Scene levels={levels} />
//     </Canvas>
//   );
// };

// function getTextCanvas(text: string): HTMLCanvasElement {
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");
//   canvas.width = 256;
//   canvas.height = 128;
//   if (ctx) {
//     ctx.fillStyle = "white";
//     ctx.font = "24px Arial";
//     ctx.fillText(text, 10, 64);
//   }
//   return canvas;
// }

// export default Page;
