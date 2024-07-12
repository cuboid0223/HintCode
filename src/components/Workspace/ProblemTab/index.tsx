import { auth, firestore } from "../../../firebase/firebase";

import { useAuthState } from "react-firebase-hooks/auth";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

import DescriptionTab from "./DescriptionTab";
import HelpTab from "./HelpTab";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { SubmissionData } from "../../../../types/testCase";
import { useRecoilState, useRecoilValue } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";
import useGetUserProblems from "@/hooks/useGetUserProblems";
import {
  submissionsDataState,
  SubmissionsDataState,
} from "@/atoms/submissionsDataAtom";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { Message } from "../../../../types/message";
import updateUserProblemScore from "@/utils/User/updateUserProblemScore";
import useGetProblemMessages from "@/hooks/useGetProblemMessages";

type ProblemTabProps = {
  // _solved: boolean;
};

const ProblemTab: React.FC<ProblemTabProps> = () => {
  const problem = useRecoilValue(problemDataState);

  const userProblems = useGetUserProblems();
  const [user] = useAuthState(auth);
  const [loadingProblemMessages, setLoadingProblemMessages] = useState(false);
  const problemMessages = useGetProblemMessages(
    user?.uid,
    problem.id,
    setLoadingProblemMessages
  );
  const { resolvedTheme } = useTheme();
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [problemTab, setProblemTab] = useState("description");
  const [remainTimes, setRemainTimes] = useState(20);
  const [{ submissions }, setSubmissionsData] =
    useRecoilState<SubmissionsDataState>(submissionsDataState);

  async function checkIsDocumentExists(userId: string, problemId: string) {
    if (!userId || !problemId) {
      throw new Error("Invalid userId or problemId");
    }

    // 獲取文件參考
    const docRef = doc(firestore, "users", userId, "problems", problemId);

    // 獲取文件快照
    const docSnap = await getDoc(docRef);

    // 確認文件是否存在
    if (docSnap.exists()) {
      console.log("Document exists:", docSnap.data());
      setThreadId(docSnap.data().threadId);
      return true;
    } else {
      console.log("Document does not exist");
      return false;
    }
  }

  const handleProblemTabChange = (value: string) => {
    setProblemTab(value);
  };

  useEffect(() => {
    if (!user) return;
    const createProblemDocument = async (id: string) => {
      if (!id || !user) return;
      try {
        const userRef = doc(firestore, "users", user?.uid);
        const problemRef = doc(userRef, "problems", problem.id);

        const problemData = {
          id: problem.id,
          threadId: id,
        };

        await setDoc(problemRef, problemData);
        console.log("Problem document created successfully!");
      } catch (error) {
        console.error("Error creating problem document:", error);
      }
    };

    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      console.log(data.threadId);
      setThreadId(data.threadId);
      return data.threadId;
    };

    const handleProblemDocument = async () => {
      try {
        const isExist = await checkIsDocumentExists(user.uid, problem.id);
        if (!isExist) {
          // 沒有存在， create threadId 加入至 users/userId/problems/[pid]
          console.log(
            ` ${user.uid} / ${problem.id} 文件不存在，正在創造該文件並產生 thread ID`
          );
          const newThreadId = await createThread();
          await createProblemDocument(newThreadId);
          setThreadId(newThreadId);
        }
      } catch (error) {
        console.error("Error checking or creating document:", error);
      }
    };
    handleProblemDocument();
  }, [threadId, user, problem.id]);

  // useEffect(() => {
  //   const userProblemRef = doc(
  //     firestore,
  //     "users",
  //     user.uid,
  //     "problems",
  //     problem.id
  //   );
  //   updateUserProblemScore(
  //     userProblemRef,
  //     problem.score,
  //     problemMessages.length
  //   );
  // }, [problemMessages, problem.id, problem.score, user?.uid]);

  return (
    <div className="relative flex flex-col ">
      {/* TABs */}

      <Tabs
        value={problemTab}
        onValueChange={handleProblemTabChange}
        defaultValue="description"
        className="flex-1 flex flex-col items-stretch overflow-hidden "
      >
        <TabsList className="p-0 pt-3 h-fit flex justify-start ">
          <TabsTrigger
            value="description"
            className="rounded-t-lg text-gray-400  !shadow-none "
          >
            問題描述
          </TabsTrigger>
          <TabsTrigger
            value="getHelp"
            className="rounded-t-lg text-gray-400  !shadow-none"
          >
            提示
          </TabsTrigger>
        </TabsList>

        <div className="overflow-y-auto overflow-x-hidden">
          {/* 程式題目敘述區 */}

          {problemTab === "description" && <DescriptionTab />}

          {/* GPT 提示區 */}
          {problemTab === "getHelp" && (
            <HelpTab
              remainTimes={remainTimes}
              setRemainTimes={setRemainTimes}
              threadId={threadId}
              messages={messages}
              setMessages={setMessages}
            />
          )}
        </div>
      </Tabs>
    </div>
  );
};
export default ProblemTab;
