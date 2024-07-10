import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  SubmissionsDataState,
  submissionsDataState,
} from "@/atoms/submissionsDataAtom";
import Message from "../Playground/components/Message";
import { isHelpBtnEnableState } from "@/atoms/isHelpBtnEnableAtom";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { problemDataState } from "@/atoms/ProblemData";
import { Message as MessageType } from "@/utils/types/message";
import useGetProblemMessages from "@/hooks/useGetProblemMessages";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { SelectForm } from "./components/SelectForm";

type ProblemHelpProps = {
  threadId: string;
  remainTimes: number;
  setRemainTimes: Dispatch<SetStateAction<number>>;
  messages: MessageType[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
};

const HelpTab: React.FC<ProblemHelpProps> = ({
  threadId,
  setMessages,
  setRemainTimes,
  messages,
  remainTimes,
}) => {
  const problem = useRecoilValue(problemDataState);
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();
  const [submissionsData, setSubmissionsData] =
    useRecoilState<SubmissionsDataState>(submissionsDataState);
  const [isHelpBtnEnable, setIsHelpBtnEnable] =
    useRecoilState(isHelpBtnEnableState);
  const [isMounted, setIsMounted] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userProblemRef = doc(
    firestore,
    "users",
    user.uid,
    "problems",
    problem.id
  );
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const prevMessages = useGetProblemMessages(
    user.uid,
    problem.id,
    setIsMessageLoading
  );

  /*
    =======================
    =====  useEffect ======
    =======================
  */
  useEffect(() => {
    if (prevMessages.length > 0) {
      setMessages(prevMessages);
    }
  }, [prevMessages, setMessages]);

  useEffect(() => {
    const updateMessagesFromFirestore = async (msgs: MessageType[]) => {
      console.log("8 ");
      console.log(msgs);
      if (!user || !problem || !msgs) return;

      try {
        const promises = msgs.map((msg) => {
          if (!msg.id) {
            console.log("no msg id");
            throw new Error("no msg id");
          }
          const msgRef = doc(
            firestore,
            "users",
            user.uid,
            "problems",
            problem.id,
            "messages",
            msg.id
          );
          return setDoc(msgRef, msg);
        });

        await Promise.all(promises);
        msgs.forEach((msg) => console.log(`Document added with ID: ${msg.id}`));
      } catch (e) {
        console.error("Error adding documents: ", e);
      }
    };

    // 如果 messages 更改，清除之前的timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // 設置新的timeout来延遲更新，避免　GPT　每產生一個字就發 request
    debounceTimeout.current = setTimeout(() => {
      updateMessagesFromFirestore(messages);
    }, 2000);

    // 清理函數，如果元件卸載則清除timeout
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [messages, user, problem]);

  // update remaining times and gradually prompt
  useEffect(() => {
    const updateRemainingTimes = async () => {
      await updateDoc(userProblemRef, {
        remainTimes: problem.totalTimes - messages.length / 2,
      });
      setRemainTimes(problem.totalTimes - messages.length / 2);
    };
    updateRemainingTimes();
  }, [messages, userProblemRef, problem, remainTimes, setRemainTimes]);

  // 當通過所有測資，將請求幫助按鈕 disable
  useEffect(() => {
    if (isAllTestCasesAccepted(submissionsData.submissions)) {
      setIsHelpBtnEnable(false);
    }
  }, [submissionsData.submissions, setIsHelpBtnEnable]);

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("msgs ", messages);
    scrollToBottom();
  }, [messages]);

  // solve react-hydration-error
  useEffect(() => {
    // https://stackoverflow.com/questions/73162551/how-to-solve-react-hydration-error-in-nextjs
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <section className="flex-1 px-5 flex flex-col ">
      {/* GPT output */}
      <div className="flex-1">
        <div
          className={`grid gap-4 justify-items-stretch ${messages.length === 0 ? "overflow-hidden" : "overflow-y-auto"} `}
        >
          {messages.map((msg, index) => (
            <Message key={index} msg={msg} theme={resolvedTheme} />
          ))}
        </div>
      </div>
      {messages.length !== 0 && <div className="mb-24" ref={messagesEndRef} />}

      <SelectForm
        setMessages={setMessages}
        threadId={threadId}
        submissionsData={submissionsData}
      />
    </section>
  );
};

export default HelpTab;
