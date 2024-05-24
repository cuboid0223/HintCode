"use client";
import { Problem } from "@/utils/types/problem";
import { SubmissionData } from "@/utils/types/testcase";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { CircleSlash, CircleCheckBig } from "lucide-react";
import Diff from "../../../HighlightedDiff";
import HighlightedDiff from "../../../HighlightedDiff";
import { Button } from "@/components/ui/button";
type TestCaseListProps = {
  problem: Problem;
  submissionsData?: SubmissionData[];
};

const TestCaseList: React.FC<TestCaseListProps> = ({
  problem,
  submissionsData,
}) => {
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);

  // automitcally scroll to bottom of testCase
  const testCaseEndRef = useRef(null);
  const scrollToBottom = () => {
    testCaseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [activeTestCaseId]);

  useEffect(() => {
    if (!submissionsData) return;
    const wrongSubmissionId = submissionsData.findIndex(
      (data) => data?.status.id !== 3
    );
    if (!wrongSubmissionId) {
      console.log("all pass");
      setActiveTestCaseId(0);
    } else {
      setActiveTestCaseId(wrongSubmissionId);
    }
  }, [submissionsData]);

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
                        ? "text-black  dark:text-white"
                        : "text-gray-300 opacity-60"
                    }
									`}
              >
                {submissionsData?.[index]?.status.id === 3 ? (
                  <CircleCheckBig color="green" className="mr-2 " />
                ) : (
                  <CircleSlash
                    color="red"
                    className={submissionsData ? "mr-2" : "hidden"}
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
          <CardDescription className="font-bold mb-2">輸入:</CardDescription>
          <div className="bg-background  p-2 rounded-lg mb-2">
            {problem.examples[activeTestCaseId]?.inputText}
          </div>
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
        </CardContent>
      </Card>
      {submissionsData && (
        <>
          <Card className=" py-1 dark:border-4 border-none	">
            <CardContent>
              <CardDescription className="font-bold mb-2">
                你的輸出:
              </CardDescription>
              <div className="bg-background p-2 rounded-lg">
                <HighlightedDiff
                  output={submissionsData[activeTestCaseId]?.stdout}
                  expectedOutput={
                    problem.examples[activeTestCaseId]?.outputText
                  }
                  diffMode={problem.diffmode}
                  addedHidden
                />
              </div>

              <CardDescription className="font-bold mb-2">
                預期輸出:
              </CardDescription>
              <div className="bg-background p-2 rounded-lg">
                <HighlightedDiff
                  output={submissionsData[activeTestCaseId]?.stdout}
                  expectedOutput={
                    problem.examples[activeTestCaseId]?.outputText
                  }
                  diffMode={problem.diffmode}
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

export default TestCaseList;
