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
  SubmissionsState,
  submissionsState,
} from "@/atoms/submissionsDataAtom";
import Message from "../Playground/components/Message";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { problemDataState } from "@/atoms/ProblemData";
import { Message as MessageType } from "@/types/message";
import useGetProblemMessages from "@/hooks/useGetProblemMessages";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { SelectForm } from "./components/SelectForm";
import { PropagateLoader } from "react-spinners";
import getUserProblemById from "@/utils/problems/getUserProblemById";
import { pid } from "process";
import CustomInputForm from "./components/CustomInputForm";
import { AssistantStream } from "openai/lib/AssistantStream";
import { v4 as uuidv4 } from "uuid";
import getSettings from "@/utils/problems/getSystemSettings";

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
  messages,
}) => {
  const problem = useRecoilValue(problemDataState);
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();
  const [submissions, setSubmissions] =
    useRecoilState<SubmissionsState>(submissionsState);
  const [isHelpBtnDisable, setIsHelpBtnDisable] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGPTTextReady, setIsGPTTextReady] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const prevMessages = useGetProblemMessages(
    user?.uid,
    problem.id,
    setIsMessageLoading
  );
  const [finalText, setFinalText] = useState("");

  const sendMessageToGPT = async (
    text: string,
    threadId: string,
    setIsGPTTextReady: Dispatch<SetStateAction<boolean>>
  ) => {
    if (!threadId || !text) return;
    setIsGPTTextReady(true);
    try {
      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
          }),
        }
      );

      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    } catch (error) {
      console.error("Error sending message to GPT:", error);
    }
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    // 在使用者傳程式碼之前，assistant message 是先被建立的，所以整個 array 之後需要 revert
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message 因為生成是一個字一個字新增的
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
      setFinalText((prevText) => prevText + delta.value);
      setIsGPTTextReady(false);
    }
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */
  const appendMessage = (role: string, text: string) => {
    // console.log(text);
    setMessages(
      (prevMessages) =>
        [
          ...prevMessages,
          { role, text, id: uuidv4(), created_at: Timestamp.now().toMillis() },
        ] as MessageType[]
    );
  };

  const appendToLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      // 在使用者傳程式碼之前，assistant message 是先被建立的，所以整個 array 需要 revert
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  /*
    =======================
    =====  useEffect ======
    =======================
  */
  useEffect(() => {
    // 渲染之前的聊天記錄
    if (prevMessages.length > 0) setMessages(prevMessages);
  }, [prevMessages, setMessages]);

  useEffect(() => {
    const updateMessagesFromFirestore = async (msgs: MessageType[]) => {
      if (!user || !problem || !msgs) return;

      try {
        const promises = msgs.map((msg) => {
          if (!msg.id) {
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
      } catch (e) {
        console.error("Error adding documents: ", e);
      }
    };

    // 如果 messages 更改，清除之前的timeout
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    // 設置新的timeout来延遲更新，避免　GPT　每產生一個字就發 request
    debounceTimeout.current = setTimeout(() => {
      updateMessagesFromFirestore(messages);
    }, 2000);

    // 清理函數，如果元件卸載則清除timeout
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [messages, user, problem]);

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 當提示次數用盡或是該題已經解決則關閉傳送訊息按鈕
    const handleHelpBtnIsDisable = async () => {
      const userProblem = await getUserProblemById(user?.uid, problem.id);
      if (userProblem?.remainTimes === 0 || userProblem?.is_solved) {
        setIsHelpBtnDisable(true);
      }
    };
    handleHelpBtnIsDisable();
  }, [problem.id, user?.uid]);

  useEffect(() => {
    const handleShowCustomInput = async () => {
      const settings = await getSettings();
      setShowCustomInput(settings.showCustomInput);
    };
    handleShowCustomInput();
  }, []);

  // solve react-hydration-error
  useEffect(() => {
    // https://stackoverflow.com/questions/73162551/how-to-solve-react-hydration-error-in-nextjs
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="flex-1 px-2 flex flex-col relative h-full">
      {/* GPT output */}
      <section className="flex-1">
        <div
          className={`grid gap-4 justify-items-stretch ${messages.length === 0 ? "overflow-hidden" : "overflow-y-auto"} `}
        >
          {messages.map((msg, index) => (
            <Message key={index} msg={msg} theme={resolvedTheme} />
          ))}
          {messages.length === 0 && (
            <h1 className="text-center md:hidden">你還沒開始任何提示</h1>
          )}
        </div>
        {/* GPT response Loader */}
        <div className=" w-full h-10 flex items-center justify-center">
          <PropagateLoader color="#36cf47" size={10} loading={isGPTTextReady} />
        </div>
        {/* 聊天記錄底部 */}
        {messages.length !== 0 && (
          <div className="h-3 md:h-6" ref={messagesEndRef} />
        )}
      </section>

      <section className="sticky w-full bottom-0 left-0  hidden md:flex flex-col gap-3 p-2   bg-opacity-40 backdrop-blur-lg ">
        {/* 客製化對話框 - 實驗組 2 */}
        <CustomInputForm
          messages={messages}
          setMessages={setMessages}
          isGPTTextReady={isGPTTextReady}
          setIsGPTTextReady={setIsGPTTextReady}
          isHelpBtnDisable={isHelpBtnDisable}
          threadId={threadId}
          sendMessageToGPT={sendMessageToGPT}
          isHidden={!showCustomInput}
          submissions={submissions}
        />

        {/* 選擇幫助類型表單 - 實驗組 1  */}
        <SelectForm
          messages={messages}
          setMessages={setMessages}
          isGPTTextReady={isGPTTextReady}
          setIsGPTTextReady={setIsGPTTextReady}
          isHelpBtnDisable={isHelpBtnDisable}
          threadId={threadId}
          sendMessageToGPT={sendMessageToGPT}
          submissions={submissions}
          isHidden={showCustomInput}
        />
      </section>
    </main>
  );
};

export default HelpTab;
