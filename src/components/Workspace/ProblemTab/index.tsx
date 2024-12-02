import { auth, firestore } from "../../../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DescriptionTab from "./DescriptionTab";
import HelpTab from "./HelpTab";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRecoilState, useRecoilValue } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";
import { Message } from "../../../types/message";
import {
  BEHAVIOR_IDS,
  CONTROL,
  UPDATE_BEHAVIORS_EVERY_N_TIMES,
} from "@/utils/const";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import getUserProblemById from "@/utils/problems/getUserProblemById";
import { BehaviorsState, behaviorsState } from "@/atoms/behaviorsAtom";
import { updateProblemBehaviors } from "@/utils/problems/updateUserProblem";
import StaticHint from "./StaticHint";
import useGroups from "@/hooks/useGroups";

const DESCRIPTION = "description";
const STATIC_HINT = "staticHint";
const GET_HELP = "getHelp";

type ProblemTabProps = {};

const ProblemTab: React.FC<ProblemTabProps> = ({}) => {
  const problem = useRecoilValue(problemDataState);
  const [behaviors, setBehaviors] =
    useRecoilState<BehaviorsState>(behaviorsState);
  const [user] = useAuthState(auth);
  const [controlGroup, experimentalGroup] = useGroups();
  const userData = useGetUserInfo();

  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [problemTab, setProblemTab] = useState(DESCRIPTION);
  const [remainTimes, setRemainTimes] = useState(20);
  const [isUserControlGroup, setIsUserControlGroup] = useState(false);

  const handleProblemTabChange = (value: string) => {
    setProblemTab(value);
    if (value === DESCRIPTION)
      setBehaviors([...behaviors, BEHAVIOR_IDS.READ_QUESTION_AGAIN]);
    if (value === STATIC_HINT)
      // 靜態提示被我歸類在 "下一步"
      setBehaviors([...behaviors, BEHAVIOR_IDS.NEXT_STEP]);
  };

  useEffect(() => {
    if (
      behaviors.length > 0 &&
      behaviors.length % UPDATE_BEHAVIORS_EVERY_N_TIMES === 0
    ) {
      // console.log("Behaviors updated:", behaviors);
      updateProblemBehaviors(user?.uid, problem.id, behaviors);
    }
  }, [behaviors, user?.uid, problem.id]);

  useEffect(() => {
    if (!user) return;

    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      setThreadId(data.threadId);
      return data.threadId;
    };

    const updateThreadId = async () => {
      try {
        const userProblem = await getUserProblemById(user.uid, problem.id);
        if (!userProblem.threadId) {
          const userProblemRef = doc(
            firestore,
            "users",
            user?.uid,
            "problems",
            problem.id
          );
          const newThreadId = await createThread();
          updateDoc(userProblemRef, { threadId: newThreadId });
          setThreadId(newThreadId);
          // console.log("沒有，造一個", threadId);
        } else {
          // console.log(`threadId 為: ${threadId}`);
          setThreadId(userProblem?.threadId);
        }
      } catch (error) {
        console.error("Error checking or creating document:", error);
      }
    };
    updateThreadId();
  }, [threadId, user, problem.id]);

  useEffect(() => {
    const getControlUnit = async () => {
      const groupRef = doc(firestore, "groups", CONTROL);
      const docSnap = await getDoc(groupRef);
      if (!docSnap.exists()) {
        // console.log("沒有控制組");
        return <div>CONTROL not found!</div>;
      }
      // console.log("控制組為 : ", docSnap.data().unit.id);
      return docSnap.data().unit.id;
    };

    const checkUserIsControlGroup = async () => {
      if (!userData) return;
      const controlGroup: string = await getControlUnit();
      if (userData?.unit.id === controlGroup) {
        setIsUserControlGroup(true);
      } else {
        setIsUserControlGroup(false);
      }
    };

    checkUserIsControlGroup();
  }, [userData]);

  return (
    <section className="relative flex flex-col">
      <Tabs
        value={problemTab}
        onValueChange={handleProblemTabChange}
        defaultValue={DESCRIPTION}
        className="flex-1 flex flex-col items-stretch overflow-hidden "
      >
        <TabsList className="p-0 pt-3 h-fit flex justify-start ">
          <TabsTrigger
            value={DESCRIPTION}
            className="rounded-t-lg text-gray-400  !shadow-none "
          >
            問題描述
          </TabsTrigger>
          {!isUserControlGroup && problem.isHelpEnabled && (
            <TabsTrigger
              value={GET_HELP}
              className="rounded-t-lg text-gray-400  !shadow-none hidden md:block"
            >
              提示
            </TabsTrigger>
          )}
          {isUserControlGroup && problem.isHelpEnabled && (
            <TabsTrigger
              value={STATIC_HINT}
              className="rounded-t-lg text-gray-400  !shadow-none "
            >
              訣竅
            </TabsTrigger>
          )}
        </TabsList>

        <div className="overflow-y-auto overflow-x-hidden">
          {/* 程式題目敘述區 */}

          {problemTab === DESCRIPTION && <DescriptionTab />}

          {/* GPT 提示區 */}
          {problemTab === GET_HELP && (
            <HelpTab
              remainTimes={remainTimes}
              setRemainTimes={setRemainTimes}
              threadId={threadId}
              messages={messages}
              setMessages={setMessages}
            />
          )}

          {/* 靜態提示區 */}
          {problemTab === STATIC_HINT && <StaticHint problem={problem} />}
        </div>
      </Tabs>
    </section>
  );
};
export default ProblemTab;
