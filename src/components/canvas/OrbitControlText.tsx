import dynamic from "next/dynamic";
import { Suspense } from "react";
import { View } from "./canvas/View";

const CustomText3D = dynamic(
  () => import("@/components/canvas/Models").then((mod) => mod.StrokeText3D),
  {
    ssr: false,
  }
);
const StrokeText3DCommon = dynamic(
  () =>
    import("@/components/canvas/Commons").then((mod) => mod.StrokeText3DCommon),
  { ssr: false }
);

function OrbitControlText({ text }) {
  return (
    <div className="overflow-hidden">
      <View orbit className="relative h-screen sm:w-full overflow-hidden">
        <Suspense fallback={null}>
          <CustomText3D text={text} />
          <StrokeText3DCommon color={"#000000"} />
        </Suspense>
      </View>
    </div>
  );
}

export default OrbitControlText;
