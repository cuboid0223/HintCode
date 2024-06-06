"use client";

import React from "react";

function PersonalInfo() {
  return (
    <div>
      {/* thumbnail 64px */}
      <div className="flex place-content-center">
        {/* problems */}
        {/* <OrbitControlText text={"9/10"} /> */}

        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          9 / 10
        </h1>

        {/* score */}
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          90 / 100
        </h1>
        {/* users rank */}
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          1 / 2
        </h1>
      </div>
    </div>
  );
}

export default PersonalInfo;
