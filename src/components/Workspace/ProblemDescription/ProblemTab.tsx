import { auth, firestore } from "../../../firebase/firebase";

import { useAuthState } from "react-firebase-hooks/auth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

import ProblemDescription from "./ProblemDescription";
import ProblemHelp from "./ProblemHelp";

import { DBProblem, Problem } from "@/utils/types/problem";
import { useEffect, useState } from "react";

type ProblemTabProps = {
  problem: Problem;
  _solved: boolean;
};

const ProblemTab: React.FC<ProblemTabProps> = ({ problem, _solved }) => {
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

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

  return (
    <div className="flex flex-col overflow-hidden">
      {/* TAB */}
      <Tabs
        defaultValue="description"
        className=" flex-1 flex flex-col items-stretch overflow-y-auto"
      >
        <TabsList className="self-start">
          <TabsTrigger value="description" className="rounded-t-lg">
            問題描述
          </TabsTrigger>
          <TabsTrigger
            value="getHelp"
            className={`rounded-t-lg ${
              resolvedTheme === "light" && "text-black"
            }`}
          >
            提示
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          {/* 程式題目敘述區 */}
          <ProblemDescription problem={problem} _solved={_solved} />
        </TabsContent>
        <TabsContent className="flex flex-col flex-1 " value="getHelp">
          {/* GPT 提示區 */}
          <ProblemHelp
            problem={problem}
            threadId={threadId}
            messages={messages}
            setMessages={setMessages}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ProblemTab;
