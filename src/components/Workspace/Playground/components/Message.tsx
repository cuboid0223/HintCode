import { Card } from "@/components/ui/card";
import CustomMarkdown from "@/components/Workspace/components/CustomMarkdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileJson2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Message as MessageType } from "@/types/message";
import TestCaseList from "./TestCaseList";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";

import { Button } from "@/components/ui/button";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getTextByType } from "@/utils/HelpTypes/getTextByType";

type MessageProps = {
  theme: string;
  msg: MessageType;
};

const USER = "user";
const ASSISTANT = "assistant";

const Message: React.FC<MessageProps> = ({ msg, theme }) => {
  switch (msg.role) {
    case USER:
      return <UserMessage msg={msg} theme={theme} />;
    case ASSISTANT:
      return <AssistantMessage msg={msg} theme={theme} />;
    default:
      return null;
  }
};

const UserMessage: React.FC<MessageProps> = ({ msg, theme }) => {
  const { code, result, text, type } = msg;

  return (
    <Card
      className={` h-fit max-w-2xl p-2 justify-self-end dark:text-white overflow-x-auto `}
    >
      {/* 
      --> str.replace(/^"(.*)"$/, '$1');  
        使用 ^ 和 $ 分別匹配字串的開頭和結尾。
        使用 "(.*)" 匹配整個字串，包括最外層的雙引號。
        使用 $1 替換匹配到的整個字串，這裡的 $1 代表匹配到的第一個捕獲組，也就是去掉最外層雙引號的字串內容。
      
      --> .replace(/\\n/g, "\n") 
        換行符號並非真的換行符號，需要替換成真的
      */}
      {code && (
        <CustomMarkdown
          theme={theme}
          showLineNumbers
        >{`~~~py\n ${code.replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n")}\n~~~`}</CustomMarkdown>
      )}

      <section className={`flex ${result && "justify-between items-center"} `}>
        <p>{getTextByType(type)}</p>
        <p>{text}</p>
        <div className="flex justify-end space-x-3 mt-3">
          {result && (
            <Popover>
              <PopoverTrigger>
                <FileJson2 />
              </PopoverTrigger>
              <PopoverContent className=" max-h-[400px] overflow-auto">
                {/* 測試結果區 */}
                <div className="flex items-center mb-3">
                  <h2
                    className={`font-bold  text-xl 
                  ${
                    // id: 3 是 Accepted
                    isAllTestCasesAccepted(result)
                      ? "text-green-600"
                      : "text-red-600"
                  }  
                  ${result.length === 0 && "hidden"}`}
                  >
                    {isAllTestCasesAccepted(result)
                      ? "Accepted"
                      : "Wrong Answer"}
                  </h2>
                </div>
                {result.length === 0 ? (
                  <h2 className="text-white">沒有測試結果</h2>
                ) : (
                  <>
                    {result[0]?.stderr && (
                      <div className="bg-red-100 rounded-lg">
                        <div
                          className="text-rose-500 p-6"
                          dangerouslySetInnerHTML={{
                            __html: result[0].stderr,
                          }}
                        />
                      </div>
                    )}

                    {!result[0]?.stderr && (
                      <TestCaseList isTestResult submissions={result} />
                    )}
                  </>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </section>
    </Card>
  );
};

const AssistantMessage: React.FC<MessageProps> = ({ msg, theme }) => {
  const [user] = useAuthState(auth);
  const params = useParams<{ pid: string }>();
  const [isLiked, setIsLiked] = useState(0);
  const [mdxContent, setMdxContent] = useState<React.ReactNode>(null); // 新增狀態來存儲 MDX 內容

  const handleLiked = async (newLikeStatus: number) => {
    const msgRef = doc(
      firestore,
      "users",
      user.uid,
      "problems",
      params.pid,
      "messages",
      msg.id
    );
    if (newLikeStatus === isLiked) {
      // reset isLiked
      setIsLiked(0);
      await setDoc(msgRef, { isLiked: 0 }, { merge: true });
    } else {
      setIsLiked(newLikeStatus);
      await setDoc(msgRef, { isLiked: newLikeStatus }, { merge: true });
    }
  };

  useEffect(() => {
    setIsLiked(msg?.isLiked);
  }, [msg?.isLiked]);

  return (
    <div className={`h-fit max-w-xl min-w-xl `}>
      <Card
        className={` p-2 dark:text-white dark:bg-[#083344] bg-blue-50 rounded-br-none rounded-bl-none`}
      >
        <CustomMarkdown theme={theme} customStyle={{ display: "inline" }}>
          {msg.text}
        </CustomMarkdown>
      </Card>

      {/* 按讚區 */}
      <div
        className={`
          flex justify-between items-center px-2 py-1 
          rounded-br-sm rounded-bl-sm
          transition-colors duration-500  
          ${isLiked === 1 && "bg-lime-800"} ${isLiked === -1 && "bg-red-800"}   
          `}
      >
        <pre className="">這則提示是否有幫助 ?</pre>
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" onClick={() => handleLiked(1)}>
            <ThumbsUp className={isLiked === 1 ? "h-6 w-6" : "h-4 w-4"} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleLiked(-1)}>
            <ThumbsDown className={isLiked === -1 ? "h-6 w-6" : "h-4 w-4"} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Message;
