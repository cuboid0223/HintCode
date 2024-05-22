import { Card } from "@/components/ui/card";
import Markdown from "react-markdown";
import { a11yDark, docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
  theme?: string;
  code: string;
};
type UserMessageProps = Omit<MessageProps, "role">;

const UserMessage = ({ text, code, theme }: UserMessageProps) => {
  return (
    <Card className={`h-fit  p-2 justify-self-end text-white`}>
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
                style={theme === "dark" ? a11yDark : docco}
                showLineNumbers
              >
                {/* 
                .replace(/"/g, "") -> 因為從 localStorage 抓下來的 string 會有多餘的 "" 需要移除，否則 markdown 會當成只有一行 
                .replace(/\\n/g, "\n") -> 因為從 localStorage 抓下來的 string 其換行符號並非真的換行符號，需要替換成真的
                .trim() -> 負責削去使用者提交的程式碼後面多餘的空白行數
                */}
                {String(children)
                  .replace(/"/g, "")
                  .replace(/\\n/g, "\n")
                  .trim()}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {`~~~py\n ${code}\n~~~`}
      </Markdown>
    </Card>
  );
};

const AssistantMessage = ({ text, theme }: { text: string; theme: string }) => {
  return (
    <Card className={`h-fit max-w-xl text-white  p-2 bg-green-600`}>
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
                style={theme === "dark" ? a11yDark : docco}
                showLineNumbers
              >
                {/* 
                .replace(/"/g, "") -> 因為從 localStorage 抓下來的 string 會有多餘的 "" 需要移除，否則 markdown 會當成只有一行 
                .replace(/\\n/g, "\n") -> 因為從 localStorage 抓下來的 string 其換行符號並非真的換行符號，需要替換成真的
                .trim() -> 負責削去使用者提交的程式碼後面多餘的空白行數
                */}
                {String(children)
                  .replace(/"/g, "")
                  .replace(/\\n/g, "\n")
                  .trim()}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </Markdown>
    </Card>
  );
};

const CodeMessage = ({ text, theme }: { text: string; theme?: string }) => {
  return (
    <div>
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

const Message = ({ role, text, theme, code }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} code={code} theme={theme} />;
    case "assistant":
      return <AssistantMessage text={text} theme={theme} />;
    case "code":
      return <CodeMessage text={text} theme={theme} />;
    default:
      return null;
  }
};

export default Message;
