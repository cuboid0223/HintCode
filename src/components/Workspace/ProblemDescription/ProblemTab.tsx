import { auth, firestore } from "../../../firebase/firebase";

import { useAuthState } from "react-firebase-hooks/auth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

import ProblemDescription from "./ProblemDescription";
import ProblemHelp from "./ProblemHelp";

import { DBProblem, Problem } from "@/utils/types/problem";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ProblemTabProps = {
  problem: Problem;
  _solved: boolean;
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
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

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
