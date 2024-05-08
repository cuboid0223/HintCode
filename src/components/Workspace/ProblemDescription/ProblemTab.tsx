import { auth, firestore } from "../../../firebase/firebase";

import { useAuthState } from "react-firebase-hooks/auth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

import ProblemDescription from "./ProblemDescription";
import ProblemHelp from "./ProblemHelp";

import { DBProblem, Problem } from "@/utils/types/problem";

type ProblemTabProps = {
  problem: Problem;
  _solved: boolean;
};

const ProblemTab: React.FC<ProblemTabProps> = ({ problem, _solved }) => {
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col">
      {/* TAB */}
      <Tabs
        defaultValue="description"
        className=" flex-1 flex flex-col items-stretch"
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
          <ProblemHelp problem={problem} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ProblemTab;
