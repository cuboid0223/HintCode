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
import updateUserProblemScore from "@/utils/User/updateUserProblemScore";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsChevronUp } from "react-icons/bs";
import { DotLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import { useSpring, animated, useSpringRef, useChain } from "react-spring";
import { showWarningToast } from "@/utils/Toast/message";

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
    toast.success("恭喜! 通過所有測試資料!", {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });

    // 更新分數
    /*
    通過就給基本分若該題總分為 100 
    基本分則為 100 * 0.8 = 80
    剩下 20 分，會根據提示次數遞減
    若沒有提示則 20 分
    一次提示 19 分
    依此類推直到 20 次機會用完 GPT 會直接給答案
    (所以使用者該題有完成最低得分會是 80 分) 
    */

    // const updateUserProblemScore = async () => {
    //   const basicScore = problem.score * ACCEPTED_BASIC_SCORE_RATE;
    //   const extraScore = problem.score * (1 - ACCEPTED_BASIC_SCORE_RATE);
    //   await updateDoc(userProblemRef, {
    //     score: basicScore + (extraScore - messages.length),
    //   });
    // };
    setIsBouncing(false);
    setSuccess(true);
    setIsPersonalInfoDialogOpen(true);
    updateUserProblemScore(userProblemRef, problem.score, messages.length);
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
          <Button className="" onClick={() => handleExecution()}>
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
