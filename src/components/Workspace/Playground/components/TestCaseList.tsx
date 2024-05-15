"use client";
import { Problem } from "@/utils/types/problem";
import { SubmissionData } from "@/utils/types/testcase";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { CircleSlash, CircleCheckBig } from "lucide-react";
import Diff from "../../../HighlightedDiff";
import HighlightedDiff from "../../../HighlightedDiff";
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
      setActiveTestCaseId(0);
    } else {
      setActiveTestCaseId(wrongSubmissionId);
    }
  }, [submissionsData]);

  return (
    <>
      <div className="flex">
        {problem.examples.map((example, index) => (
          <div
            className="mr-2 items-start my-2 "
            key={example.id}
            onClick={() => setActiveTestCaseId(index)}
          >
            <div className="flex flex-wrap items-center gap-y-4">
              <div
                className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap
										${activeTestCaseId === index ? "text-white" : "text-gray-500"}
									`}
              >
                {submissionsData?.[index]?.status.id === 3 ? (
                  <CircleCheckBig color="green" />
                ) : (
                  <CircleSlash
                    color="red"
                    className={submissionsData ? "" : "hidden"}
                  />
                )}
                <p className="ml-2"> 測資 {index + 1}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Card className="mb-6">
        <CardContent>
          <CardDescription className="font-bold mb-2">輸入:</CardDescription>
          <div className="bg-gray-400 p-3 rounded-lg mb-2">
            {problem.examples[activeTestCaseId].inputText}
          </div>
          <CardDescription className="font-bold mb-2">
            預期輸出:
          </CardDescription>
          <div
            className="bg-gray-400 p-3 rounded-lg"
            dangerouslySetInnerHTML={{
              __html: problem.examples[activeTestCaseId].outputText.replace(
                /\n/g,
                "<br>"
              ),
            }}
          ></div>
        </CardContent>
      </Card>
      {submissionsData && (
        <>
          <Card>
            <CardContent>
              <CardDescription className="font-bold mb-2">
                你的輸出:
              </CardDescription>
              <div
                className="bg-gray-400 p-3 rounded-lg mb-2"
                dangerouslySetInnerHTML={{
                  __html: submissionsData[activeTestCaseId]?.stdout.replace(
                    /\n/g,
                    "<br>"
                  ),
                }}
              ></div>
              <CardDescription className="font-bold mb-2">
                預期輸出:
              </CardDescription>
              <div
                className="bg-gray-400 p-3 rounded-lg"
                dangerouslySetInnerHTML={{
                  __html: problem.examples[activeTestCaseId].outputText.replace(
                    /\n/g,
                    "<br>"
                  ),
                }}
              ></div>
            </CardContent>
          </Card>

          <div ref={testCaseEndRef} />
        </>
      )}

      <HighlightedDiff
        output={"Hello World\nHello World\n"}
        expectedOutput={
          "Hello World\nHello World\nHello World\nHello World\nHello World\n"
        }
        removedHidden
        diffMode="line"
        // addedHidden
      />
      <HighlightedDiff
        output={"[0,2]"}
        expectedOutput={"[0,1]"}
        // removedHidden
        addedHidden
      />
      <HighlightedDiff
        output={"[0,2]"}
        expectedOutput={"[0,1]"}
        removedHidden
        // addedHidden
      />
    </>
  );
};

export default TestCaseList;
