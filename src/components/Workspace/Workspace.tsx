"use client";
import { useState } from "react";
import Split from "react-split";

import Playground from "./Playground/Playground";
import { Problem } from "@/utils/types/problem";
import Confetti from "react-confetti";
import useWindowSize from "../../hooks/useWindowSize";
import ProblemTab from "./ProblemDescription/ProblemTab";

type WorkspaceProps = {
  problem: Problem;
};

const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
  const { width, height } = useWindowSize();
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);

  return (
    <Split className="split flex-1 overflow-hidden" minSize={0}>
      {/* 左半 程式題目敘述區與 GPT 提示區 */}
      <ProblemTab problem={problem} _solved={solved} />

      {/* 右半 程式碼輸入區與測試資料區 */}
      <Playground
        problem={problem}
        setSuccess={setSuccess}
        setSolved={setSolved}
      />
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
