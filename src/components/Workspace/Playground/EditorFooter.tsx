import { problemDataState } from "@/atoms/ProblemData";
import { Button } from "@/components/ui/button";
import { auth, firestore } from "@/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsChevronUp } from "react-icons/bs";
import { DotLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";

type EditorFooterProps = {
  handleExecution: () => void;
  isLoading: boolean;
  isAllTestCasesAccepted: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditorFooter: React.FC<EditorFooterProps> = ({
  handleExecution,
  isLoading,
  isAllTestCasesAccepted,
  setSuccess,
}) => {
  const [user] = useAuthState(auth);
  const problem = useRecoilValue(problemDataState);

  const handleSubmitCode = async () => {
    const userProblemRef = doc(
      firestore,
      "users",
      user.uid,
      "problems",
      problem.id
    );
    if (!isAllTestCasesAccepted) {
      toast.warning("需要通過所有測試資料才能繳交", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
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
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

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
          <Button
            disabled={!isAllTestCasesAccepted}
            className="font-bold	 text-white bg-dark-green-s hover:bg-green-3"
            onClick={handleSubmitCode}
          >
            繳交
          </Button>
        </div>
      </div>
    </div>
  );
};
export default EditorFooter;
