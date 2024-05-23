import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { a11yDark, docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type CustomMarkdownType = {
  theme: string;
  children: string | null | undefined;
};

const CustomMarkdown: React.FC<CustomMarkdownType> = ({ theme, children }) => {
  return (
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
              {String(children).replace(/"/g, "").replace(/\\n/g, "\n").trim()}
            </SyntaxHighlighter>
          ) : (
            <code
              {...rest}
              className="text-white dark:text-black bg-gray-400 px-1  "
            >
              {children}
            </code>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
};

export default CustomMarkdown;
