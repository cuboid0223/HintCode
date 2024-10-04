import React, { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  a11yDark,
  androidstudio,
  docco,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Languages } from "@/types/global";

type CustomMarkdownType = {
  theme: string;
  children: string | null | undefined;
};

const CustomMarkdown: React.FC<CustomMarkdownType> = ({ theme, children }) => {
  const ref = useRef<SyntaxHighlighter>(null);
  const [lang] = useLocalStorage("selectedLang", "py");

  const getLanguage = (className: string | undefined) => {
    // const match = /language-(\w+)/.exec(className || "");
    // console.log("match[1]", match);
    // if (match) {
    //   return match[1];
    // }

    // console.log(lang === "vb" ? "vbnet" : "python");
    return lang === "vb" ? "vbnet" : "python";
  };

  const getStyle = (theme: string, lang: string) => {
    if (theme === "dark" && lang === "py") return a11yDark;
    if (theme === "light" && lang === "py") return docco;
    if (theme === "dark" && lang === "vb") return androidstudio;
    return androidstudio; // 默认样式
  };

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const language = getLanguage(className);
          return language ? (
            <SyntaxHighlighter
              style={getStyle(theme, lang)}
              language={language}
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
