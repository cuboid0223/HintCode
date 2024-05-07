import React, { useEffect, useRef } from "react";
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
import { useRecoilState } from "recoil";
import { submissionsDataState } from "@/atoms/submissionsDataAtom";
import { SubmissionData } from "@/utils/types/testcase";
import { useChat as useSubmitToGPT } from "ai/react";
import { Button } from "@/components/ui/button";
import { stdout } from "process";

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
  const lang = localStorage.getItem("selectedLang");
  const latestTestCode = localStorage.getItem(`latest-test-py-code`);
  const getHintFormRef = useRef<HTMLFormElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [submissionsData, setSubmissionsData] =
    useRecoilState<SubmissionData[]>(submissionsDataState);

  // 1. 題目敘述 problem.problemStatement (done)
  // 2. 使用者程式碼 -> 應為測資當時提交的程式碼
  // 3. 使用者程式碼測資輸出 submissionsData 都要有 (done)
  // 可能要用 recoil 的 global state 處理

  const {
    messages,
    input,
    setInput,
    handleSubmit: handleSubmitToGPT,
    isLoading: isHintLoading,
  } = useSubmitToGPT({
    api: "/api/hint",
    onResponse: (response) => {
      if (response.status === 429) {
        window.alert("GPT 請求次數已達上限");
        return;
      }
    },
  });

  const clickGetHintBtn = async () => {
    const wrongSubmissions = getWrongAnswerSubmissions(submissionsData);

    if (!latestTestCode || !submissionsData || !wrongSubmissions) {
      console.log(
        `there is no ${latestTestCode} or ${submissionsData} or${wrongSubmissions}`
      );
      return;
    }

    setInput(`
    <info>
    ${problem.problemStatement}
    </info>
    <code>${formatCode(latestTestCode)}</code>
    <output>${JSON.stringify(formatSubmissions(wrongSubmissions))}</output>
    `);

    // 表單傳送
    getHintFormRef.current?.requestSubmit();
  };

  const clickTestBtn = () => {
    const wrongSubmissions = getWrongAnswerSubmissions(submissionsData);
    if (!wrongSubmissions) return;
    console.log(
      formatCode(
        `def twoSum(nums, target):\n  # Write your code her\n   print([0,1])fuck\n\n\n'''\ndef twoSum(nums, target):\n  # Write your code her\n  n = len(nums)\n  for i in range(n - 1):\n      for j in range(i + 1, n):\n          if nums[i] + nums[j] == target:\n              print([i,j])\n              return [i, j]\n  return [] \n'''\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`
      )
    );

    console.log(JSON.stringify(formatSubmissions(wrongSubmissions)));
  };

  function formatCode(code: string) {
    return code
      .replace(/^\s*'''\s*/, "") // 移除開始的'''以及前面的空格
      .replace(/\s*'''$/, "") // 移除結尾的'''以及後面的空格
      .trim(); // 移除前後的空格
  }

  const formatSubmissions = (data: SubmissionData[]) => {
    const formattedData = data.map((ele, id) => {
      return `
      測資${id + 1} : 其輸出為 ${ele.stdout ? stdout : "空"}，錯誤為${
        ele.stderr ? ele.stderr : "空"
      }，訊息為${ele.message ? ele.message : "空"}，判斷為 ${
        ele.status.description
      }
      
      `;
      // return {
      //   test_id: id + 1,
      //   stdout: ele.stdout,
      //   stderr: ele.stderr,
      //   message: ele.message,
      //   status: ele.status.description,
      // };
    });
    return formattedData;
  };

  const getWrongAnswerSubmissions = (data: SubmissionData[]) => {
    // 取得 submissionsData 陣列中 data.status.id 不為 3 換句話講就是 wrong answer 的 submission
    if (data.length === 0) return;

    return data.filter((obj) => {
      return obj.status.id !== 3;
    });
  };

  useEffect(() => {
    console.log("GPT :", messages);
  }, [messages]);

  const isGetHintBtnDisabled = isHintLoading || latestTestCode?.length === 0;
  return (
    <section className="p-5 grid justify-items-stretch   overflow-y-auto ">
      <Button variant="outline" onClick={clickTestBtn}>
        Test
      </Button>
      <form ref={getHintFormRef} onSubmit={handleSubmitToGPT}>
        <Button
          variant="outline"
          onClick={clickGetHintBtn}
          disabled={isGetHintBtnDisabled}
        >
          {/* <RingLoader color="#36d7b7" loading={submitBtnDisabled} size={20} /> */}
          {isGetHintBtnDisabled ? "Loading..." : "Submit"}
        </Button>
      </form>
      {/* GPT output */}
      {messages.map(({ content, role }, id) => (
        <Card
          key={id}
          className={`h-fit max-w-lg mb-6 p-2 ${
            role === "user" && "justify-self-end"
          }`}
        >
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
                    <tr
                      className="m-0 border-t p-0 even:bg-muted"
                      {...rest}
                    ></tr>
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
              {content}
            </Markdown>
          </CardContent>
        </Card>
      ))}
      {/* user message code */}
      {/* 要包含 使用者提交的程式碼  和 submissionsData  */};
      {/* <Card className="justify-self-end max-w-md h-fit mb-6">
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
      </Card> */}
    </section>
  );
};

export default ProblemHelp;
