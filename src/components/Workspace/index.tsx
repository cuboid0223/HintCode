"use client";
import { useRef, useState } from "react";
import Split from "react-split";
import Playground from "./Playground";
import Confetti from "react-confetti";
import useWindowSize from "../../hooks/useWindowSize";
import ProblemTab from "./ProblemTab";
import { useTheme } from "next-themes";
import HintUsefulDialog from "../Dialogs/HintUsefulDialog";
import { useRecoilState } from "recoil";
import { isPersonalInfoDialogOpenState } from "@/atoms/isPersonalInfoDialogOpen";
import DaGaKoToWaRuDialog from "../Dialogs/DaGaKoToWaRuDialog";

const Workspace = ({}) => {
  const { resolvedTheme } = useTheme();
  const { width, height } = useWindowSize();
  const splitRef = useRef();
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);
  const [isHintUsefulDialogOpen, setIsHintUsefulDialogOpen] = useState(true);
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] =
    useRecoilState(isPersonalInfoDialogOpenState);

  return (
    <>
      <Split
        key={resolvedTheme} // 使用 theme 作為 key 以強制重新渲染
        ref={splitRef}
        className="split flex-1 overflow-hidden "
        minSize={0}
        gutter={(_, direction) => {
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
      </Split>
      {/* 提示有用問卷 */}
      {/* !isPersonalInfoDialogOpen -> 處理 Modal 同時顯示的問題 */}
      {success && !isPersonalInfoDialogOpen && (
        <>
          <HintUsefulDialog
            isHintUsefulDialogOpen={isHintUsefulDialogOpen}
            setIsHintUsefulDialogOpen={setIsHintUsefulDialogOpen}
            setSuccess={setSuccess}
          />
        </>
      )}

      {/* 解題成功撒花  */}
      {success && (
        <Confetti
          gravity={0.3}
          tweenDuration={4000}
          width={width - 1}
          height={height - 1}
        />
      )}

      {/* 反暴力破解法 */}
      <DaGaKoToWaRuDialog />
    </>
  );
};
export default Workspace;
