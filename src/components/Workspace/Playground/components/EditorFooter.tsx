import { isPersonalInfoDialogOpenState } from "@/atoms/isPersonalInfoDialogOpen";
import { problemDataState } from "@/atoms/ProblemData";
import {
  submissionsState,
  SubmissionsState,
} from "@/atoms/submissionsDataAtom";
import { Button } from "@/components/ui/button";
import { auth, firestore } from "@/firebase/firebase";
import useGetProblemMessages from "@/hooks/useGetProblemMessages";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsChevronUp } from "react-icons/bs";
import { DotLoader } from "react-spinners";
import { useRecoilState, useRecoilValue } from "recoil";
import { useSpring, animated } from "react-spring";
import { showSuccessToast, showWarningToast } from "@/utils/Toast/message";
import { updateProblemBehaviors } from "@/utils/problems/updateUserProblem";
import { BehaviorsState, behaviorsState } from "@/atoms/behaviorsAtom";

type EditorFooterProps = {
  handleExecution: () => void;
  isLoading: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditorFooter: React.FC<EditorFooterProps> = ({
  handleExecution,
  isLoading,
  setSuccess,
}) => {
  const [user] = useAuthState(auth);
  const problem = useRecoilValue(problemDataState);
  const [submissions, setSubmissions] =
    useRecoilState<SubmissionsState>(submissionsState);
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] =
    useRecoilState(isPersonalInfoDialogOpenState);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isBouncing, setIsBouncing] = React.useState(false);
  const [behaviors, setBehaviors] =
    useRecoilState<BehaviorsState>(behaviorsState);
  const messages = useGetProblemMessages(
    user?.uid,
    problem?.id,
    setIsMessageLoading
  );
  const handleSubmitCode = async () => {
    const userProblemRef = doc(
      firestore,
      "users",
      user.uid,
      "problems",
      problem.id
    );
    if (!isAllTestCasesAccepted(submissions)) {
      showWarningToast("通過所有測試資料才能繳交");
      return;
    }

    await updateDoc(userProblemRef, {
      is_solved: true,
    });
    showSuccessToast("恭喜! 通過所有測試資料!");
    updateProblemBehaviors(user?.uid, problem.id, behaviors);
    setIsBouncing(false);
    setSuccess(true);
    setIsPersonalInfoDialogOpen(true);
  };

  useEffect(() => {
    if (isAllTestCasesAccepted(submissions)) {
      setIsBouncing(true);
    }
  }, [submissions]);

  return (
    <div className="flex  w-full bg-card">
      <div className="mx-5 my-[10px] flex justify-between w-full">
        <div className="mr-2 flex flex-1 flex-nowrap items-center space-x-4">
          <Button className="">
            Console
            <div className="ml-1 transform transition flex items-center">
              <BsChevronUp className="fill-gray-6 mx-1 fill-dark-gray-6" />
            </div>
          </Button>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Button className="" onClick={() => handleExecution()} disabled={isLoading}>
            {isLoading ? (
              <p className="flex place-items-center">
                <DotLoader color="#36d7b7" size={27} />
                {/* <pre>執行中...</pre> */}
              </p>
            ) : (
              "執行"
            )}
          </Button>
          <BouncyButton
            isBouncing={isBouncing}
            disabled={!isAllTestCasesAccepted(submissions)}
            className="font-bold	 text-white bg-dark-green-s hover:bg-green-3"
            onClick={handleSubmitCode}
          >
            繳交
          </BouncyButton>
        </div>
      </div>
    </div>
  );
};

const BouncyButton = ({
  disabled,
  className,
  onClick,
  isBouncing,
  children,
}) => {
  const { transform } = useSpring({
    from: { transform: "translateY(0px)" },
    to: async (next) => {
      if (isBouncing) {
        while (isBouncing) {
          await next({ transform: "translateY(-10px)" });
          await next({ transform: "translateY(0px)" });
        }
      } else {
        await next({ transform: "translateY(0px)" });
      }
    },
    config: { duration: 350 },
  });

  return (
    <animated.div style={{ transform }}>
      <Button disabled={disabled} className={className} onClick={onClick}>
        {children}
      </Button>
    </animated.div>
  );
};

export default EditorFooter;
