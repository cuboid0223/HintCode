"use client";
import { useEffect, useRef, useState } from "react";
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
import getUserProblemById from "@/utils/problems/getUserProblemById";
import { auth } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import updateProblemLockStatus from "@/utils/problems/updateProblemLockStatus";
import useGetProblemGroup from "@/hooks/useGetProblemGroup";
import { useParams } from "next/navigation";

const Workspace = ({}) => {
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();
  const { pid } = useParams<{ pid: string }>();
  const { width, height } = useWindowSize();
  const splitRef = useRef();
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);
  const [isHintUsefulDialogOpen, setIsHintUsefulDialogOpen] = useState(true);
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] =
    useRecoilState(isPersonalInfoDialogOpenState);
  const { problemGroup } = useGetProblemGroup();

  useEffect(() => {
    // ***
    const unlockNextProblem = async (pid: string, problemGroup: string[]) => {
      const currentProblem = await getUserProblemById(user?.uid, pid);
      if (currentProblem.isLocked) return;

      // 獲取當前問題所在的組
      const targetGroup = problemGroup.find((group) => group.includes(pid));

      if (targetGroup && targetGroup.length !== 0) {
        // 找出當前問題的索引
        const currentProblemIndex = targetGroup.indexOf(pid);
        // 如果下一個題目存在，檢查它是否解鎖
        const nextProblemId = targetGroup[currentProblemIndex + 1];

        if (currentProblem.is_solved) {
          await updateProblemLockStatus(user?.uid, nextProblemId, false);
        }
      } else {
        console.log(`找不到 ${pid} 所屬組別 `);
      }
    };

    if (success) unlockNextProblem(pid, problemGroup);
  }, [user?.uid, problemGroup, pid, success]);

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
