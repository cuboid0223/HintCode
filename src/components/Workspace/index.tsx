"use client";
import { useRef, useState } from "react";
import Split from "react-split";

import Playground from "./Playground";
import Confetti from "react-confetti";
import useWindowSize from "../../hooks/useWindowSize";
import ProblemTab from "./ProblemTab";
import { useTheme } from "next-themes";

const Workspace = () => {
  const { resolvedTheme } = useTheme();
  const { width, height } = useWindowSize();
  const splitRef = useRef();
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);

  return (
    <Split
      key={resolvedTheme} // 使用 theme 作為 key 以強制重新渲染
      ref={splitRef}
      className="split flex-1 overflow-hidden "
      minSize={0}
      gutter={(index, direction) => {
        const gutter = document.createElement("div");
        gutter.className = `gutter gutter-${direction} ${
          resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-300 "
        } `;
        return gutter;
      }}
    >
      {/* 左半 程式題目敘述區與 GPT 提示區 */}
      <ProblemTab />

      {/* 右半 程式碼輸入區與測試資料區 */}
      <Playground setSuccess={setSuccess} setSolved={setSolved} />
      {/* 解題成功撒花 */}
      {success && (
        <Confetti
          gravity={0.3}
          tweenDuration={4000}
          width={width - 1}
          height={height - 1}
        />
      )}
    </Split>
  );
};
export default Workspace;
