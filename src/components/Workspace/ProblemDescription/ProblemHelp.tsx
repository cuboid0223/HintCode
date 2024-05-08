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
import { useChat as useSubmitToGPT } from "ai/react";
import { Button } from "@/components/ui/button";
import { AssistantStream } from "openai/lib/AssistantStream";
import { Input } from "@/components/ui/input";

type ProblemHelpProps = {
  problem: Problem;
  threadId: string;
  messages: MessageProps[];
  setMessages: Dispatch<SetStateAction<MessageProps[]>>;
};

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
  theme?: string;
};
const UserMessage = ({ text }: { text: string }) => {
  return (
    <Card className={`h-fit max-w-lg mb-6 p-2 justify-self-end`}>{text}</Card>
  );
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <Card className={`h-fit max-w-lg mb-6 p-2 bg-red-400`}>
      <Markdown>{text}</Markdown>
    </Card>
  );
};

const CodeMessage = ({ text, theme }: { text: string; theme: string }) => {
  return (
    <div>
      {/* {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))} */}

      <SyntaxHighlighter
        language="python"
        style={theme === "dark" ? a11yDark : docco}
        showLineNumbers
        wrapLongLines
      >
        {text}
      </SyntaxHighlighter>
    </div>
  );
};

const Message = ({ role, text, theme }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} theme={theme} />;
    default:
      return null;
  }
};

const ProblemHelp: React.FC<ProblemHelpProps> = ({
  problem,
  threadId,
  messages,
  setMessages,
}) => {
  const lang = localStorage.getItem("selectedLang");
  const latestTestCode = localStorage.getItem(`latest-test-py-code`);
  const getHintFormRef = useRef<HTMLFormElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [submissionsData, setSubmissionsData] =
    useRecoilState<SubmissionData[]>(submissionsDataState);

  const [userInput, setUserInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);

  // const {
  //   messages,
  //   input,
  //   setInput,
  //   handleSubmit: handleSubmitToGPT,
  //   isLoading: isHintLoading,
  // } = useSubmitToGPT({
  //   api: "/api/hint",
  //   onResponse: (response) => {
  //     if (response.status === 429) {
  //       window.alert("GPT 請求次數已達上限");
  //       return;
  //     }
  //   },
  // });

  const clickGetHintBtn = async () => {
    const wrongSubmissions = getWrongAnswerSubmissions(submissionsData);

    if (!latestTestCode || !submissionsData || !wrongSubmissions) {
      console.log(
        `there is no ${latestTestCode} or ${submissionsData} or${wrongSubmissions}`
      );
      return;
    }

    setInput(`
    <info>
    ${problem.problemStatement}
    </info>
    <code>${formatCode(latestTestCode)}</code>
    <output>${formatSubmissions(wrongSubmissions)}</output>
    `);

    // 表單傳送
    getHintFormRef.current?.requestSubmit();
  };

  const clickTestBtn = () => {
    const wrongSubmissions = getWrongAnswerSubmissions(submissionsData);
    if (!wrongSubmissions) return;
    console.log(
      formatCode(
        `def twoSum(nums, target):\n  # Write your code her\n   print([0,1])fuck\n\n\n'''\ndef twoSum(nums, target):\n  # Write your code her\n  n = len(nums)\n  for i in range(n - 1):\n      for j in range(i + 1, n):\n          if nums[i] + nums[j] == target:\n              print([i,j])\n              return [i, j]\n  return [] \n'''\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`
      )
    );

    console.log(JSON.stringify(formatSubmissions(wrongSubmissions)));
  };

  function formatCode(code: string) {
    return code
      .replace(/^\s*'''\s*/, "") // 移除開始的'''以及前面的空格
      .replace(/\s*'''$/, "") // 移除結尾的'''以及後面的空格
      .trim(); // 移除前後的空格
  }

  const formatSubmissions = (data: SubmissionData[]) => {
    const formattedData = data.map((ele, id) => {
      return `
      測資${id + 1} : 其輸出為 ${ele.stdout ? ele.stdout : "空"}，錯誤為${
        ele.stderr ? ele.stderr : "空"
      }，訊息為${ele.message ? ele.message : "空"}，判斷為 ${
        ele.status.description
      }
      
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

  // automitcally scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    console.log("GPT :", messages);
    scrollToBottom();
  }, [messages]);

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

    請不要給我答案，給我一些提示就好
    `;

    // sendMessage(userInput); // 目前禁止學生直接接觸 GPT
    sendMessage(template);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    // setInputDisabled(true);
    scrollToBottom();
  };

  // const isGetHintBtnDisabled = isHintLoading || latestTestCode?.length === 0;
  return (
    <section className="relative flex-1 p-5 grid justify-items-stretch  overflow-y-auto ">
      {/* <Button variant="outline" onClick={clickTestBtn}>
        Test
      </Button> */}
      {/* GPT output */}
      {messages.map((msg, index) => (
        <Message
          key={index}
          role={msg.role}
          text={msg.text}
          theme={resolvedTheme}
        />
      ))}
      {messages.length === 0 && <div>你可以先把能想到的全打上去</div>}
      <div ref={messagesEndRef} />
      <form
        className="absolute bottom-0 p-5 flex w-full items-center space-x-2 "
        onSubmit={handleSubmit}
      >
        <Input
          className="flex-1  "
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />
        <Button type="submit" disabled={inputDisabled}>
          Send
        </Button>
      </form>
      {/* user message code */}
      {/* 要包含 使用者提交的程式碼  和 submissionsData  */};
      {/* <Card className="justify-self-end max-w-md h-fit mb-6">
        <CardContent className="p-0">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter
                    {...rest}
                    language="python"
                    style={resolvedTheme === "dark" ? a11yDark : docco}
                    showLineNumbers
                  >
                    {children}
                  </SyntaxHighlighter>
                ) : (
                  <code {...rest} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {markdown2}
          </Markdown>
        </CardContent>
      </Card> */}
    </section>
  );
};

export default ProblemHelp;
