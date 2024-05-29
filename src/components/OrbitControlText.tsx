import dynamic from "next/dynamic";
import { Suspense } from "react";
import { View } from "./canvas/View";

const CustomText3D = dynamic(
  () => import("@/components/canvas/Models").then((mod) => mod.CustomText3D),
  {
    ssr: false,
  }
);
const Common = dynamic(
  () => import("@/components/canvas/View").then((mod) => mod.Common),
  { ssr: false }
);

function OrbitControlText() {
  return (
    // <Canvas>
    //   <Text
    //     color="transparent"
    //     anchorX="center"
    //     anchorY="middle"
    //     strokeColor="white"
    //     strokeWidth="1"
    //   >
    //     Just go ahead and type in whatever comes to mind.
    //     <meshNormalMaterial />
    //   </Text>
    // </Canvas>
    <div className="overflow-hidden">
      <View orbit className="relative h-screen sm:w-full overflow-hidden">
        <Suspense fallback={null}>
          <CustomText3D />
          <Common color={"#000000"} />
        </Suspense>
      </View>
    </div>
  );
}

export default OrbitControlText;
