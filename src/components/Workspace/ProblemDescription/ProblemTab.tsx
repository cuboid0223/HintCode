import { auth, firestore } from "../../../firebase/firebase";

import { useAuthState } from "react-firebase-hooks/auth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

import ProblemDescription from "./ProblemDescription";
import ProblemHelp from "./ProblemHelp";

import { DBProblem, Problem } from "@/utils/types/problem";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc, getDoc } from "firebase/firestore";

type ProblemTabProps = {
  problem: Problem;
  _solved: boolean;
};

export type MessageProps = {
  role: "user" | "assistant" | "code";
  text?: string;
  theme?: string;
  code?: string;
};

const ProblemTab: React.FC<ProblemTabProps> = ({ problem, _solved }) => {
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState([]);
  const [problemTab, setProblemTab] = useState("description");

  // create a new threadID when chat component created
  useEffect(() => {
    console.log("create thread");
  }, []);

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

    const checkAndCreateProblemDocument = async () => {
      try {
        const isExist = await checkIsDocumentExists(user.uid, problem.id);
        if (isExist) {
          // 有存在
          // console.log("Document exists");
        } else {
          // 沒有， create threadId 加入至 problems/[pid]
          console.log("Document does not exist, creating...");
          const newThreadId = await createThread();
          await createProblemDocument(newThreadId);
          setThreadId(newThreadId);
        }
      } catch (error) {
        console.error("Error checking or creating document:", error);
      }
    };
    checkAndCreateProblemDocument();
  }, [threadId, user, problem.id]);

  useEffect(() => {
    const getMessages = async () => {
      if (!threadId) return;
      // console.log("threadId from getMessages ", threadId);
      const messages = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "GET",
        }
      );
      const msgs = await messages.json();
      console.log(msgs);
      // console.log(messages.data[1].role);
      // console.log(messages.data[0].content[0].text.value);
      let temp = [] as MessageProps[];
      msgs.data.forEach((msg) => {
        temp.push({
          role: msg.role,
          text: msg.content[0].text.value,
        });
      });
      setMessages(temp.reverse());
    };

    getMessages();
  }, [threadId]);

  const handleProblemTabChange = (value: string) => {
    setProblemTab(value);
  };

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* TABs */}
      <AnimatePresence>
        <Tabs
          value={problemTab}
          onValueChange={handleProblemTabChange}
          defaultValue="description"
          className="flex-1 flex flex-col items-stretch overflow-y-auto overflow-x-hidden"
        >
          <TabsList className="self-start p-0 pt-1 ">
            <TabsTrigger
              value="description"
              className="rounded-t-lg text-gray-400 h-full !shadow-none"
            >
              問題描述
            </TabsTrigger>
            <TabsTrigger
              value="getHelp"
              className="rounded-t-lg text-gray-400  h-full !shadow-none"
            >
              提示
            </TabsTrigger>
          </TabsList>

          {/* 程式題目敘述區 */}

          {problemTab === "description" && (
            <motion.div
              className="flex-1 flex"
              key={problemTab}
              initial={{ x: -5, opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              layout
            >
              <ProblemDescription problem={problem} _solved={_solved} />
            </motion.div>
          )}

          {/* GPT 提示區 */}
          {problemTab === "getHelp" && (
            <motion.div
              className="flex-1 flex "
              key={problemTab}
              initial={{ x: 5, opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              layout
              layoutScroll
            >
              <ProblemHelp
                problem={problem}
                threadId={threadId}
                messages={messages}
                setMessages={setMessages}
              />
            </motion.div>
          )}
        </Tabs>
      </AnimatePresence>
    </div>
  );
};
export default ProblemTab;
