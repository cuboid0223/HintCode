import React, { useEffect } from "react";
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
const markdown = `
### Hi, *Pluto*!
Just a link: www.nasa.gov.

A paragraph with *emphasis* and **strong importance**
> A block quote with ~strikethrough~ and a URL: https://reactjs.org.
- p
- s
* Lists
* [ ] todo
* [x] done

A table:
| a | b | c |
| - | - | - |
| d | b | c |
| - | s | - |
| d | b | c |
| - | s | - |


> ssssss


~~~py
def hello():
  print('It works!')
  
print('It works!')
~~~
`;

const markdown2 = `
~~~py
def hello():
  print('It works!')
  
print('It works!')
~~~
`;

type ProblemHelpProps = {
  problem: Problem;
};

const ProblemHelp: React.FC<ProblemHelpProps> = ({ problem }) => {
  const { resolvedTheme, setTheme } = useTheme();
  // 1. 題目敘述 problem.problemStatement (done)
  // 2. 使用者程式碼 -> local storage 有 py-code-two-sum (有換行符號需移除)
  // 3. 使用者程式碼測資輸出 submissionsData, submissionError 都要有
  // 可能要用 recoil 的 global state 處理

  return (
    <section className="p-5 grid justify-items-stretch   overflow-y-auto ">
      {/* GPT output */}
      <Card className="h-fit max-w-lg mb-6 p-2">
        <CardContent>
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // markdown components integrated with shadcn UI
              h3({ className, ...rest }) {
                return (
                  <h3
                    className="scroll-m-20 text-2xl font-semibold tracking-tight"
                    {...rest}
                  ></h3>
                );
              },
              ul({ className, ...rest }) {
                return (
                  <ul
                    className="my-6 ml-6 list-disc [&>li]:mt-2"
                    {...rest}
                  ></ul>
                );
              },
              table({ className, ...rest }) {
                return <table className="w-full mb-6" {...rest}></table>;
              },
              tr({ className, ...rest }) {
                return (
                  <tr className="m-0 border-t p-0 even:bg-muted" {...rest}></tr>
                );
              },
              th({ className, ...rest }) {
                return (
                  <th
                    className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></th>
                );
              },
              td({ className, ...rest }) {
                return (
                  <td
                    className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></td>
                );
              },
              blockquote({ className, ...rest }) {
                return (
                  <blockquote
                    className="mt-6 border-l-2 pl-6 italic"
                    {...rest}
                  ></blockquote>
                );
              },
              code({ children, className, node, ...rest }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  //  SyntaxHighlighter 沒有提供 Type
                  <SyntaxHighlighter
                    {...rest}
                    language="python"
                    style={resolvedTheme === "dark" ? a11yDark : docco}
                    showLineNumbers
                    wrapLongLines
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
            {markdown}
          </Markdown>
        </CardContent>
      </Card>
      {/* user message code */}
      {/* 要包含 使用者提交的程式碼  和 submissionsData, submissionError  */};
      <Card className="justify-self-end max-w-md h-fit mb-6">
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
      </Card>
      <Card className="h-fit max-w-lg mb-6 p-2">
        <CardContent>
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // markdown components integrated with shadcn UI
              h3({ className, ...rest }) {
                return (
                  <h3
                    className="scroll-m-20 text-2xl font-semibold tracking-tight"
                    {...rest}
                  ></h3>
                );
              },
              ul({ className, ...rest }) {
                return (
                  <ul
                    className="my-6 ml-6 list-disc [&>li]:mt-2"
                    {...rest}
                  ></ul>
                );
              },
              table({ className, ...rest }) {
                return <table className="w-full mb-6" {...rest}></table>;
              },
              tr({ className, ...rest }) {
                return (
                  <tr className="m-0 border-t p-0 even:bg-muted" {...rest}></tr>
                );
              },
              th({ className, ...rest }) {
                return (
                  <th
                    className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></th>
                );
              },
              td({ className, ...rest }) {
                return (
                  <td
                    className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></td>
                );
              },
              blockquote({ className, ...rest }) {
                return (
                  <blockquote
                    className="mt-6 border-l-2 pl-6 italic"
                    {...rest}
                  ></blockquote>
                );
              },
              code({ children, className, node, ...rest }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  //  SyntaxHighlighter 沒有提供 Type
                  <SyntaxHighlighter
                    {...rest}
                    language="python"
                    style={docco}
                    showLineNumbers
                    wrapLongLines
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
            {markdown}
          </Markdown>
        </CardContent>
      </Card>
    </section>
  );
};

export default ProblemHelp;
