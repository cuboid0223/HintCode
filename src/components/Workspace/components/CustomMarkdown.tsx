import React, { useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  a11yDark,
  androidstudio,
  docco,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useLocalStorage } from "@uidotdev/usehooks";

type CustomMarkdownType = {
  theme: string;
  customStyle?: React.CSSProperties;
  showLineNumbers?: boolean;
  children: string | null | undefined;
};

const CustomMarkdown: React.FC<CustomMarkdownType> = ({
  theme,
  customStyle = { display: "block", fontSize: "14px" },
  showLineNumbers = false,
  children,
}) => {
  const ref = useRef<SyntaxHighlighter>(null);
  const [lang] = useLocalStorage("selectedLang", "py");

  const getLanguage = () => {
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
          const selectedLanguage = getLanguage();
          return selectedLanguage ? (
            <SyntaxHighlighter
              PreTag="code"
              codeTagProps={{
                style: { border: "none", fontSize: "14px", lineHeight: "1.5" },
              }}
              customStyle={{
                display: "block",
                ...customStyle,
              }}
              style={getStyle(theme, lang)}
              language={selectedLanguage}
              showLineNumbers={showLineNumbers}
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
