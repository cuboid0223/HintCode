import { Card } from "@/components/ui/card";
import CustomMarkdown from "@/components/Workspace/components/CustomMarkdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, CopyCheck, FileJson2 } from "lucide-react";
import { Message as MessageType } from "@/utils/types/message";
import TestCaseList from "./TestCaseList";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { useEffect, useState } from "react";
type MessageProps = {
  theme: string;
  msg: MessageType;
};

const Message: React.FC<MessageProps> = ({ msg, theme }) => {
  switch (msg.role) {
    case "user":
      return <UserMessage msg={msg} theme={theme} />;
    case "assistant":
      return <AssistantMessage msg={msg} theme={theme} />;
    // case "code":
    //   return <CodeMessage text={text} theme={theme} />;
    default:
      return null;
  }
};

const UserMessage: React.FC<MessageProps> = ({ msg, theme }) => {
  const { code, result, text } = msg;

  const handleFormatCode = (text: string) => {
    // 將程式碼轉換為正常的格式
    if (!text) return;
    const code = text
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, "'")
      .replace(/\\t/g, "\t");
    return code;
  };

  useEffect(() => {
    console.log(result?.submissions.length);
  }, [result?.submissions.length]);

  return (
    <Card
      className={`h-fit max-w-2xl p-2 justify-self-end dark:text-white overflow-x-auto `}
    >
      <CustomMarkdown theme={theme}>
        {`~~~py\n ${handleFormatCode(code)}\n~~~`}
      </CustomMarkdown>
      <p>{text}</p>
      <div className="flex justify-end space-x-3 mt-3">
        {result?.submissions && (
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
                    isAllTestCasesAccepted(result?.submissions)
                      ? "text-green-600"
                      : "text-red-600"
                  }  
                  ${result?.submissions.length === 0 && "hidden"}`}
                >
                  {isAllTestCasesAccepted(result?.submissions)
                    ? "Accepted"
                    : "Wrong Answer"}
                </h2>
              </div>
              {result?.submissions.length === 0 ? (
                <h2 className="text-white">沒有測試結果</h2>
              ) : (
                <>
                  {result?.submissions[0]?.stderr && (
                    <div className="bg-red-100 rounded-lg">
                      <div
                        className="text-rose-500 p-6"
                        dangerouslySetInnerHTML={{
                          __html: result?.submissions[0].stderr,
                        }}
                      />
                    </div>
                  )}

                  {!result?.submissions[0]?.stderr && (
                    <TestCaseList
                      isTestResult
                      submissions={result?.submissions}
                    />
                  )}
                </>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </Card>
  );
};

const AssistantMessage: React.FC<MessageProps> = ({ msg, theme }) => {
  return (
    <Card
      className={`h-fit max-w-2xl dark:text-white  p-2 dark:bg-[#083344] bg-blue-50`}
    >
      <CustomMarkdown theme={theme}>{msg.text}</CustomMarkdown>
    </Card>
  );
};

export default Message;
