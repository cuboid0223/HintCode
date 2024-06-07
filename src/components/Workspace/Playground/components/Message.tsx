import { Card } from "@/components/ui/card";
import CustomMarkdown from "@/components/CustomMarkdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, CopyCheck, FileJson2 } from "lucide-react";
import { Message as MessageType } from "@/utils/types/message";
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
  const handleCodeFromText = (text: string) => {
    // 將 prompt templete 字串提取 python 程式碼部分
    const codeMatch = text?.match(
      /=+code start=+\n([\s\S]*?)\n\s*=+code end=+/
    );
    let extractedCode = codeMatch ? codeMatch[1] : "no code";

    // 將提取的程式碼轉換為正常的格式
    extractedCode = extractedCode
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\t/g, "\t");
    return extractedCode;
  };

  return (
    <Card
      className={`h-fit max-w-2xl p-2 justify-self-end dark:text-white overflow-x-auto `}
    >
      <CustomMarkdown theme={theme}>
        {`~~~py\n ${msg?.code}\n~~~`}
      </CustomMarkdown>
      <div className="flex justify-end space-x-3 mt-3">
        {/* <CopyCheck /> */}
        <Copy />
        <Popover>
          <PopoverTrigger>
            <FileJson2 />
          </PopoverTrigger>
          <PopoverContent></PopoverContent>
        </Popover>
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
