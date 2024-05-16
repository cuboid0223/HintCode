import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Problem } from "@/utils/types/problem";
import { useRecoilState } from "recoil";
import { submissionsDataState } from "@/atoms/submissionsDataAtom";
import { SubmissionData } from "@/utils/types/testcase";
import { Button } from "@/components/ui/button";
import { AssistantStream } from "openai/lib/AssistantStream";
import { Input } from "@/components/ui/input";
import Message from "../Playground/components/Message";
import { RingLoader } from "react-spinners";
type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
  theme?: string;
  code: string;
};

type ProblemHelpProps = {
  problem: Problem;
  threadId: string;
  messages: MessageProps[];
  setMessages: Dispatch<SetStateAction<MessageProps[]>>;
};

const ProblemHelp: React.FC<ProblemHelpProps> = ({
  problem,
  threadId,
  messages,
  setMessages,
}) => {
  const lang = localStorage.getItem("selectedLang");
  const latestTestCode = localStorage.getItem(`latest-test-py-code`) || "";
  const { resolvedTheme } = useTheme();
  const [submissionsData] =
    useRecoilState<SubmissionData[]>(submissionsDataState);

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);

  function formatCode(code: string) {
    // 這裡要檢查 formatCode 到底輸出是啥
    return code
      .replace(/^\s*'''\s*/, "") // 移除開始的'''以及前面的空格
      .replace(/\s*'''$/, "") // 移除結尾的'''以及後面的空格
      .trim(); // 移除前後的空格
  }

  const formatSubmissions = (data: SubmissionData[]) => {
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

  const getWrongAnswerSubmissions = (data: SubmissionData[]) => {
    // 取得 submissionsData 陣列中 data.status.id 不為 3 換句話講就是 wrong answer 的 submission
    if (data.length === 0) return;

    return data.filter((obj) => {
      return obj.status.id !== 3;
    });
  };

  const sendMessage = async (text: string) => {
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
    // setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    // stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    // stream.on("toolCallCreated", toolCallCreated);
    // stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    // stream.on("event", (event) => {
    //   if (event.event === "thread.run.requires_action")
    //     handleRequiresAction(event);
    //   if (event.event === "thread.run.completed") handleRunCompleted();
    // });
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    // setInputDisabled(false);
    console.log("assistant messages all done");
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
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
  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const appendToLastMessage = (text) => {
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
    const wrongSubmissions = getWrongAnswerSubmissions(submissionsData);
    // if (!userInput.trim()) return;
    if (!latestTestCode || !wrongSubmissions) return;

    const template = `
    題目如下:
    ${problem.problemStatement}
    
    以下是我的程式碼:
    ${formatCode(latestTestCode)}

    以下是經過測試後的輸出:
    ${formatSubmissions(wrongSubmissions)}

    請不要給我答案，請透過疑問句讓我反思問題所在
    `;

    // sendMessage(userInput); // 目前禁止學生直接接觸 GPT
    // setMessages((prevMessages) => [
    //   ...prevMessages,
    //   { role: "user", text: userInput },
    // ]);

    sendMessage(template);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", code: latestTestCode, text: "" },
    ]);

    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
    setIsLoading(false);
  };
  /*
    =======================
    =====  useEffect ======
    =======================
  */
  // automitcally scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <section className="flex-1 p-5 grid justify-items-stretch  overflow-y-auto ">
      {/* GPT output */}
      {messages.map((msg, index) => (
        <Message
          key={index}
          role={msg.role}
          text={msg.text}
          code={latestTestCode}
          theme={resolvedTheme}
        />
      ))}
      {messages.length === 0 && <div>你可以先把能想到的全打上去</div>}
      <div className="mb-10" ref={messagesEndRef} />
      <form
        className=" absolute bottom-0 p-5 pr-7 flex w-full items-center space-x-2 "
        onSubmit={handleSubmit}
      >
        <Input
          className="flex-1"
          type="text"
          disabled // 目前先關起來
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />
        <Button className="font-bold" type="submit" disabled={isLoading}>
          {isLoading ? <RingLoader color="#36d7b7" size={27} /> : "Help"}
        </Button>
      </form>
    </section>
  );
};

export default ProblemHelp;
