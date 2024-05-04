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

function ProblemHelp() {
  return (
    <main className="p-5 pb-52 grid justify-items-stretch  h-screen  overflow-y-auto ">
      {/* card list for GPT output */}
      <Card className="border-8  h-fit max-w-lg mb-6 p-2">
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
                    style={a11yDark}
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
    </main>
  );
}

export default ProblemHelp;
