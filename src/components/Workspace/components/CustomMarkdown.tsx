import React, { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { a11yDark, docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type CustomMarkdownType = {
  theme: string;
  children: string | null | undefined;
};

const CustomMarkdown: React.FC<CustomMarkdownType> = ({ theme, children }) => {
  const ref = useRef<SyntaxHighlighter>(null);

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              style={theme === "dark" ? a11yDark : docco}
              language="python"
              showLineNumbers
            >
              {String(children).trim()}
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
