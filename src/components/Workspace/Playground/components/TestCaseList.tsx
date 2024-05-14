/*
data {
  stdout: '[0, 1]\n',
  time: '0.007',
  memory: 3220,
  stderr: '',
  token: '154fa2cc-7dc7-4a78-a16e-0dba35db6207',
  compile_output: '',
  message: '',
  status: { id: 3, description: 'Accepted' }
}
 POST /problems/two-sum 200 in 449ms
p:  [ { pid: 'two-sum' } ]
base64ToString(stdout)  [1, 2]

data {
  stdout: '[1, 2]\n',
  time: '0.007',
  memory: 3312,
  stderr: '',
  token: 'bc437c94-8921-4ef5-89cc-ccf0333c7329',
  compile_output: '',
  message: '',
  status: { id: 3, description: 'Accepted' }
}
 POST /problems/two-sum 200 in 414ms
base64ToString(stdout)  [0, 1]

data {
  stdout: '[0, 1]\n',
  time: '0.007',
  memory: 3220,
  stderr: '',
  token: '9696033a-70a8-4121-aa8c-3ea57dcabf1a',
  compile_output: '',
  message: '',
  status: { id: 3, description: 'Accepted' }
}
 POST /problems/two-sum 200 in 418ms
p:  [ { pid: 'two-sum' } ]
*/
"use client";
import { Problem } from "@/utils/types/problem";
import { SubmissionData } from "@/utils/types/testcase";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleSlash, CircleCheckBig } from "lucide-react";

type TestCaseListProps = {
  problem: Problem;
  submissionsData?: SubmissionData[];
};

const TestCaseList: React.FC<TestCaseListProps> = ({
  problem,
  submissionsData,
}) => {
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);

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
                {submissionsData?.[index].status.id === 3 ? (
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
        </>
      )}
    </>
  );
};

export default TestCaseList;
