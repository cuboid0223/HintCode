"use client";
import { Submission } from "@/types/testCase";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { CircleSlash, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecoilValue } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";
import HighlightedDiff from "@/components/Workspace/components/HighlightedDiff";
import { ACCEPTED_STATUS_ID } from "@/utils/const";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { a11yDark, docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";

type TestCaseListProps = {
  isTestResult?: boolean;
  submissions: Submission[];
};

const TestCaseList: React.FC<TestCaseListProps> = ({
  isTestResult, // 用在測試結果區而非測試資料區
  submissions,
}) => {
  const problem = useRecoilValue(problemDataState);
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
  const testCaseEndRef = useRef(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!submissions) return;
    const wrongSubmissionId = submissions.findIndex(
      (data) => data?.status.id !== 3
    );
    if (wrongSubmissionId === -1) {
      setActiveTestCaseId(0);
    } else {
      setActiveTestCaseId(wrongSubmissionId);
    }
  }, [submissions]);

  const scrollToBottom = () => {
    testCaseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isAllTestCasesAccepted(submissions)) scrollToBottom();
  }, [submissions]);

  return (
    <div className="grow overflow-y-auto">
      <div className="flex">
        {problem.examples.map((example, index) => (
          <Button
            className="mr-2 items-start my-2 bg-card hover:bg-muted "
            key={example.id}
            onClick={() => setActiveTestCaseId(index)}
          >
            <div className="flex flex-wrap items-center gap-y-4">
              <div
                className={` font-medium items-center transition-all focus:outline-none inline-flex  relative whitespace-nowrap
										${
                      activeTestCaseId === index
                        ? "text-black dark:text-white"
                        : "text-gray-300 opacity-60"
                    }
									`}
              >
                {isTestResult && (
                  <SubmissionStatusIcon
                    index={index}
                    submissions={submissions}
                  />
                )}

                <p
                  className={`${
                    activeTestCaseId === index ? "font-bold " : ""
                  }`}
                >
                  測資 {index + 1}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
      <Card className="mb-6 dark:border-2 border-none ">
        <CardContent>
          {problem.examples[activeTestCaseId]?.inputText && (
            <>
              <CardDescription className="font-bold mb-2">
                輸入:
              </CardDescription>
              {/* <div className="bg-background  p-2 rounded-lg mb-2">
                {problem.examples[activeTestCaseId]?.inputText}
              </div> */}
              <SyntaxHighlighter
                PreTag="code"
                codeTagProps={{
                  style: {
                    border: "none",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  },
                }}
                customStyle={{ display: "block" }}
                style={resolvedTheme === "dark" ? a11yDark : docco}
                language="python"
              >
                {problem.examples[activeTestCaseId]?.inputText}
              </SyntaxHighlighter>
            </>
          )}

          <CardDescription className="font-bold mb-2">
            預期輸出:
          </CardDescription>
          <div
            className="bg-background p-2 rounded-lg"
            dangerouslySetInnerHTML={{
              __html: problem.examples[activeTestCaseId]?.outputText.replace(
                /\n/g,
                "<br>"
              ),
            }}
          ></div>
          {/* <SyntaxHighlighter
            style={resolvedTheme === "dark" ? a11yDark : docco}
            language="python"
          >
            {problem.examples[activeTestCaseId]?.outputText}
          </SyntaxHighlighter> */}
        </CardContent>
      </Card>
      {isTestResult && (
        <>
          <Card className=" py-1 dark:border-4 border-none	">
            <CardContent>
              <CardDescription className="font-bold mb-2">
                你的輸出:
              </CardDescription>
              <div className="bg-background p-2 rounded-lg">
                <HighlightedDiff
                  output={submissions[activeTestCaseId]?.stdout}
                  expectedOutput={
                    problem.examples[activeTestCaseId]?.outputText
                  }
                  addedHidden
                />
              </div>

              <CardDescription className="font-bold mb-2">
                預期輸出:
              </CardDescription>

              <div className="bg-background p-2 rounded-lg">
                <HighlightedDiff
                  output={submissions[activeTestCaseId]?.stdout}
                  expectedOutput={
                    problem.examples[activeTestCaseId]?.outputText
                  }
                  removedHidden
                />
              </div>
            </CardContent>
          </Card>

          <div ref={testCaseEndRef} />
        </>
      )}
    </div>
  );
};

const SubmissionStatusIcon = ({
  index,
  submissions,
}: {
  index: number;
  submissions: Submission[];
}) => {
  if (submissions?.length !== 0) {
    const statusId = submissions?.[index]?.status.id;
    if (statusId === ACCEPTED_STATUS_ID) {
      return <CircleCheckBig color="green" className="mr-2 " />;
    } else {
      return (
        <CircleSlash color="red" className={submissions ? "mr-2" : "hidden"} />
      );
    }
  }
  return null; // 如果不符合任何條件，返回 null
};

export default TestCaseList;
