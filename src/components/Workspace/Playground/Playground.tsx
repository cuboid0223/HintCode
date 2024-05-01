import { useState, useEffect, useRef } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import EditorFooter from "./EditorFooter";
import { Problem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/firebase";
import { toast } from "react-toastify";
import { problems } from "@/utils/problems";
import { useRouter } from "next/navigation";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { testUserCode, getSubmissionData } from "@/actions/testCodeAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PlaygroundProps = {
  problem: Problem;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

export type Settings = {
  fontSize: string;
  settingsModalIsOpen: boolean;
  dropdownIsOpen: boolean;
  selectedLang: "py" | "js";
};

export type SubmissionData = {
  memory: number;
  status: {
    description: string;
    id: number;
  };
  stdout: string;
  time: string;
  token: string;
  stderr: string;
  message: string;
  compile_output: string;
};

const Playground: React.FC<PlaygroundProps> = ({
  problem,
  setSuccess,
  setSolved,
}) => {
  const { id } = problem;

  let [userCode, setUserCode] = useState<string>(problem.starterCode.js);

  const [fontSize, setFontSize] = useLocalStorage("lcc-fontSize", "16px");
  const [submissionData, setSubmissionData] = useState<SubmissionData>();
  const isAccepted = submissionData?.status.id === 3;
  const [testTab, setTestTab] = useState("testcase");
  const [settings, setSettings] = useState<Settings>({
    fontSize: fontSize,
    settingsModalIsOpen: false,
    dropdownIsOpen: false,
    selectedLang: "py",
  });
  const { selectedLang } = settings;

  const [user] = useAuthState(auth);

  const checkStarterFunctionName = (userCode: string) => {
    if (!userCode.includes(problem.starterFunctionName[selectedLang])) {
      toast.error(
        `函式名稱必須是 ${problem.starterFunctionName[selectedLang]} `,
        {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        }
      );
      return;
    }
  };

  const handleExecution = async (executionMode: "submit" | "run") => {
    if (!user) {
      toast.error("登入後才能執行程式", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (selectedLang === "js") {
      // handle js testCase
      const isPassed = handleJSTestCase();
      if (isPassed && executionMode === "submit") {
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, {
          solvedProblems: arrayUnion(id),
        });
        setSolved(true);
        console.log("submit");
      }
    }
    if (selectedLang === "py") {
      checkStarterFunctionName(userCode);
      // ***  handle python testCase
      // 這裡需要後端測試服務，看是要使用 flask 或是 django

      userCode = userCode.slice(
        userCode.indexOf(problem.starterFunctionName.py)
      );
      try {
        const token = await testUserCode({
          userCode: userCode,
          expectedOutput: "cube",
        });
        const data = await getSubmissionData(token);
        //  "ca59b542-006d-4698-bf75-5af48a62db50"
        console.log("here", data);
        setSubmissionData(data);
        setTestTab("testResult");
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      }
    }
  };

  const handleJSTestCase = () => {
    try {
      // 將 userCode 字串從該位置開始一直到結尾的部分截取出來
      userCode = userCode.slice(
        userCode.indexOf(problem.starterFunctionName.js)
      );
      checkStarterFunctionName(userCode);
      const cb = new Function(`return ${userCode}`)();
      const handler = problems[id as string].handlerFunction;

      if (typeof handler === "function") {
        const isPassed = handler(cb);
        if (isPassed) {
          toast.success("恭喜! 通過所有測試資料!", {
            position: "top-center",
            autoClose: 3000,
            theme: "dark",
          });
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
          }, 4000);
        }
        return isPassed;
      }
    } catch (error: any) {
      console.log(error.message);
      if (
        error.message.startsWith(
          "AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:"
        )
      ) {
        toast.error("Oops! One or more test cases failed", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      } else {
        toast.error(error.message, {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      }
    }
  };

  useEffect(() => {
    const code = localStorage.getItem(`${selectedLang}-code-${id}`);
    if (user) {
      setUserCode(code ? JSON.parse(code) : problem.starterCode.js);
    } else {
      setUserCode(problem.starterCode.js);
    }
  }, [id, user, problem.starterCode, selectedLang]);

  const onChange = (value: string) => {
    setUserCode(value);
    localStorage.setItem(`${selectedLang}-code-${id}`, JSON.stringify(value));
  };

  const handleTestTabChange = (value: string) => {
    setTestTab(value);
  };

  return (
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <PreferenceNav settings={settings} setSettings={setSettings} />

      <Split
        className="h-[calc(100vh-94px)]"
        direction="vertical"
        sizes={[60, 40]}
        minSize={60}
      >
        {/*　Playground */}
        <div className="w-full overflow-auto">
          <CodeMirror
            value={userCode}
            theme={vscodeDark}
            onChange={onChange}
            extensions={[
              settings.selectedLang === "py" ? python() : javascript(),
            ]}
            style={{ fontSize: settings.fontSize }}
          />
        </div>

        <div className="w-full px-5 overflow-auto">
          {/* Tabs: testcase */}
          <Tabs
            value={testTab}
            defaultValue="testcase"
            onValueChange={handleTestTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger value="testcase" className="relative">
                <div className="text-sm font-medium ">測試資料</div>
                <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none " />
              </TabsTrigger>
              <TabsTrigger value="testResult" className="relative">
                <div className="text-sm font-medium leading-5 ">測試結果</div>
                <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none " />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="testcase">
              {/* 測試資料區 */}
              <TestCaseList problem={problem} />
            </TabsContent>
            <TabsContent value="testResult">
              {/* 測試結果區 */}
              {submissionData ? (
                <>
                  <div className="flex items-center mb-3">
                    <h2
                      className={`font-bold  text-xl ${
                        isAccepted ? "text-green-600" : "text-red-600"
                      } `}
                    >
                      {submissionData.status.description}
                    </h2>
                    <pre className="text-sm text-muted-foreground ml-3">
                      Runtime: {submissionData.time} ms
                    </pre>
                  </div>
                  {submissionData.stderr && (
                    <div className="bg-red-100  rounded-lg">
                      <div
                        className="text-rose-500 p-6"
                        dangerouslySetInnerHTML={{
                          __html: submissionData.stderr,
                        }}
                      />
                    </div>
                  )}
                  {!submissionData.stderr && <TestCaseList problem={problem} />}
                </>
              ) : (
                <h2>沒有測試結果</h2>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Split>
      <EditorFooter handleExecution={handleExecution} />
    </div>
  );
};

// --------------------------------記得移到新的 file--------------------------------
/*
{
  stdout: undefined,
  time: '0.008',
  memory: 3164,
  stderr: '  File "script.py", line 3\n' +
    '    print("cubse")s\n' +
    '                  ^\n' +
    'SyntaxError: invalid syntax\n',
  token: '2db0416c-ad4f-49bf-a60c-58096c9327cb',
  compile_output: undefined,
  message: 'Exited with error status 1',
  status: { id: 11, description: 'Runtime Error (NZEC)' }
}
*/

type TestCaseListProps = {
  problem: Problem;
};

const TestCaseList: React.FC<TestCaseListProps> = ({ problem }) => {
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
  return (
    <>
      <div className="flex">
        {problem.examples.map((example, index) => (
          <div
            className="mr-2 items-start mt-2 "
            key={example.id}
            onClick={() => setActiveTestCaseId(index)}
          >
            <div className="flex flex-wrap items-center gap-y-4">
              <div
                className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap
										${activeTestCaseId === index ? "text-white" : "text-gray-500"}
									`}
              >
                測資 {index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="font-semibold my-4">
        <p className="text-sm font-medium mt-4 text-white">Input:</p>
        <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
          {problem.examples[activeTestCaseId].inputText}
        </div>
        <p className="text-sm font-medium mt-4 text-white">Output:</p>
        <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
          {problem.examples[activeTestCaseId].outputText}
        </div>
      </div>
    </>
  );
};

export default Playground;
