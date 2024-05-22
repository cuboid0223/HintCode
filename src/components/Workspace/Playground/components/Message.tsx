import { Card } from "@/components/ui/card";
import CustomMarkdown from "@/components/CustomMarkdown";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
  theme: string;
  code: string;
};
type UserMessageProps = Omit<MessageProps, "role">;
type AssistantMessageProps = Omit<MessageProps, "role">;

const Message = ({ role, text, theme, code }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} code={code} theme={theme} />;
    case "assistant":
      return <AssistantMessage text={text} code={code} theme={theme} />;
    // case "code":
    //   return <CodeMessage text={text} theme={theme} />;
    default:
      return null;
  }
};

const UserMessage = ({ text, code, theme }: UserMessageProps) => {
  const handleCodeFromText = (text: string) => {
    // 將 prompt templete 字串提取 python 程式碼部分
    const codeMatch = text.match(/=+code start=+\n([\s\S]*?)\n\s*=+code end=+/);
    let extractedCode = codeMatch ? codeMatch[1] : "no code";

    // 將提取的程式碼轉換為正常的格式
    extractedCode = extractedCode
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\t/g, "\t");
    return extractedCode;
  };

  return (
    <Card className={`h-fit  p-2 justify-self-end text-white`}>
      <CustomMarkdown theme={theme}>
        {`~~~py\n ${handleCodeFromText(text)}\n~~~`}
      </CustomMarkdown>
    </Card>
  );
};

const AssistantMessage = ({ text, code, theme }: AssistantMessageProps) => {
  return (
    <Card className={`h-fit max-w-xl text-white  p-2 bg-green-600`}>
      <CustomMarkdown theme={theme}>{text}</CustomMarkdown>
    </Card>
  );
};

export default Message;
