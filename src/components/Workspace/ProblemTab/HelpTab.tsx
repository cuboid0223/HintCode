import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { Problem } from "@/utils/types/problem";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  SubmissionsDataState,
  submissionsDataState,
} from "@/atoms/submissionsDataAtom";
import { SubmissionData } from "@/utils/types/testCase";
import { AssistantStream } from "openai/lib/AssistantStream";
import { Input } from "@/components/ui/input";
import Message from "../Playground/components/Message";
import { RingLoader } from "react-spinners";
import { toast } from "react-toastify";
import { isHelpBtnEnableState } from "@/atoms/isHelpBtnEnableAtom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";
import { problemDataState } from "@/atoms/ProblemData";

import { Message as MessageType } from "@/utils/types/message";
import useGetProblemMessages from "@/hooks/useGetProblemMessages";

import getWrongTestCases from "@/utils/testCases/getWrongTestCases";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
type ProblemHelpProps = {
  threadId: string;
  remainTimes: number;
  setRemainTimes: Dispatch<SetStateAction<number>>;
  messages: MessageType[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
};

const HelpTab: React.FC<ProblemHelpProps> = ({
  threadId,
  // messages,
  setMessages,
  setRemainTimes,
  remainTimes,
}) => {
  const problem = useRecoilValue(problemDataState);
  const latestTestCode = localStorage.getItem(`latest-test-py-code`) || ""; // 最後一次提交的程式碼
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();
  const [submissionsData, setSubmissionsData] =
    useRecoilState<SubmissionsDataState>(submissionsDataState);
  const [isHelpBtnEnable, setIsHelpBtnEnable] =
    useRecoilState(isHelpBtnEnableState);
  const [userInput, setUserInput] = useState("");
  const [helpType, setHelpType] = useState("能否提示下一步的邏輯?");
  const [isLoading, setIsLoading] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [finalText, setFinalText] = useState("");
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
  const messages = useGetProblemMessages(
    user.uid,
    problem.id,
    setIsMessageLoading
  );
  const [graduallyPrompt, setGraduallyPrompt] = useState(
    "請不要給我答案，請隱晦的提示我，讓我反思問題所在"
  );
  const [isHelpBtnHidden, setIsHelpBtnHidden] = useState(false);
  const formatCode = (code: string) => {
    // 這裡要檢查 formatCode 到底輸出是啥
    return code
      .replace(/^\s*'''\s*/, "") // 移除開始的'''以及前面的空格
      .replace(/\s*'''$/, "") // 移除結尾的'''以及後面的空格
      .trim(); // 移除前後的空格
  };

  const formatSubmissions = (data: SubmissionData[]) => {
    /*
    將測試資料的結果轉成純文字(自然語言)，方便 GPT 讀取
    */
    const formattedData = data.map((ele, id) => {
      const output = ele.stdout ? ele.stdout : "空";
      const error = ele.stderr ? ele.stderr : "空";
      const msg = ele.message ? ele.message : "空";
      const status = ele.status.description;
      return `
      測資${
        id + 1
      } : 其輸出為 ${output}，錯誤為 ${error}，訊息為 ${msg}，判斷為 ${status}
      `;
    });
    return formattedData;
  };

  const sendMessageToGPT = async (text: string) => {
    if (!threadId) {
      console.log("no thread id");
    }
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
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    // 在使用者傳程式碼之前，assistant message 是先被建立的，所以整個 array 需要 revert
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
      setFinalText((prevText) => prevText + delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };
  /*
    =======================
    === Utility Helpers ===
    =======================
  */
  const appendMessage = (role: string, text: string) => {
    console.log(text);
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

      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };

      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsHelpBtnEnable(false);
    // *** submissionsData 需要丟進 firestore
    const { submissions } = submissionsData;
    const wrongSubmissions = getWrongTestCases(submissions);
    // if (!userInput.trim()) return;
    if (!latestTestCode || !wrongSubmissions) {
      toast.warn("沒有測試結果，請按執行按鈕", {
        position: "top-center",
        autoClose: 3000,
        theme: resolvedTheme,
      });
      setIsLoading(false);
      return;
    }
    // 請不要輕易試著更改下方所有字串，包含空格或是格式化
    const promptTemplate = `
    題目如下:
=========problem statement start========
    ${problem.problemStatement}
=========problem statement end==========
    
    以下是我的程式碼:
==========code start==========

    ${formatCode(latestTestCode)}

===========code end===========

    以下是經過測試後的輸出:
=========test output start=======
    ${formatSubmissions(wrongSubmissions)}
=========test output end=========

    ${graduallyPrompt}
    `;

    sendMessageToGPT(promptTemplate);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: uuidv4(),
        role: "user",
        code: latestTestCode,
        created_at: Timestamp.now().toMillis(),
        result: submissionsData,
        text: `
==========code start==========

    ${formatCode(latestTestCode)}

===========code end===========
      `,
      },
    ]);

    // setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
    setIsLoading(false);
  };

  /*
    =======================
    =====  useEffect ======
    =======================
  */

  useEffect(() => {
    const updateMessagesFromFirestore = async (msgs: MessageType[]) => {
      if (!user || !problem || !msgs) return;
      console.log(msgs);
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

    // 設置新的timeout来延遲更新，避免　GPT　每更新一個字就發 requests
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
    // 20 -> 12 + 6 + 2
    const updateGraduallyPrompt = () => {
      let times = problem.totalTimes - messages.length / 2;
      if (12 <= times && times <= problem.totalTimes) {
        setGraduallyPrompt("請不要給我答案，請隱晦的提示我，讓我反思問題所在");
      } else if (3 <= times && times <= 11) {
        setGraduallyPrompt("請不要給我答案，請明確的提示我，讓我反思問題所在");
      } else if (0 < times && times <= 2) {
        // times <= 2
        setGraduallyPrompt("請給我答案，詳細解釋答案，並提出反思問題");
      } else {
        // times <= 0 隱藏幫助按鈕
        setIsHelpBtnHidden(true);
      }
    };

    updateRemainingTimes();
    updateGraduallyPrompt();
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

      <form
        className="absolute bottom-0 left-0 p-3 z-50 flex w-full items-center space-x-2 bg-card "
        onSubmit={handleSubmit}
      >
        <Input
          className="flex-1"
          type="text"
          disabled // 目前先關起來
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`剩餘 ${remainTimes} 次提示機會 `}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="font-bold mr-3"
              type="submit"
              hidden={isHelpBtnHidden}
              disabled={isLoading || !isHelpBtnEnable}
            >
              {isLoading ? (
                <RingLoader color="#36d7b7" size={27} />
              ) : (
                "請求幫助"
              )}
            </TooltipTrigger>
            <TooltipContent>
              {isAllTestCasesAccepted(submissionsData.submissions) ? (
                <p>您已通過測試</p>
              ) : (
                <p>需要按下執行按鈕產生結果</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
    </section>
  );
};

export default HelpTab;
