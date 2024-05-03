import { useState, useEffect, useRef } from "react";
import PreferenceNav from "./components/PreferenceNav";
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
import TestCaseList from "./components/TestCaseList";
import { SubmissionData } from "@/utils/types/testcase";

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

const Playground: React.FC<PlaygroundProps> = ({
  problem,
  setSuccess,
  setSolved,
}) => {
  const { id } = problem;

  let [userCode, setUserCode] = useState<string>(problem.starterCode.js);

  const [fontSize, setFontSize] = useLocalStorage("lcc-fontSize", "16px");
  const [submissionsData, setSubmissionsData] = useState<SubmissionData[]>([]);
  const [submissionError, setSubmissionError] = useState<SubmissionData | null>(
    null
  );
  const isAccepted = submissionsData.every(
    (submission) => submission.status.id === 3
  );
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
    // if (selectedLang === "js") {
    //   // handle js testCase
    //   const isPassed = handleJSTestCase();
    //   if (isPassed && executionMode === "submit") {
    //     const userRef = doc(firestore, "users", user.uid);
    //     await updateDoc(userRef, {
    //       solvedProblems: arrayUnion(id),
    //     });
    //     setSolved(true);
    //     console.log("submit");
    //   }
    // }
    if (selectedLang === "py") {
      checkStarterFunctionName(userCode);
      // handle python testCase
      userCode = userCode.slice(
        userCode.indexOf(problem.starterFunctionName.py)
      );
      let temp: SubmissionData[] = [];

      try {
        await Promise.all(
          problem.testCaseCode.map(async (testCase) => {
            const token = await testUserCode({
              userCode: userCode + testCase.inputCode, // inputCode 用來執行函式呼叫
              expectedOutput: testCase.output,
            });
            const data = await getSubmissionData(token);
            if (data.stderr) {
              // 當語法錯誤時，在第一個 case 之後就要停止後續的 test case
              setSubmissionError(data);
              console.log("錯誤發生應停止後續的 test case");
              return;
            }
            temp.push(data);
          })
        );

        setSubmissionsData(temp);
        setTestTab("testResult");
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      }
    }
  };

  useEffect(() => {
    console.log("submissionsData: ", submissionsData);
  }, [submissionsData]);

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
              <div className="flex items-center mb-3">
                <h2
                  className={`font-bold  text-xl 
                  ${
                    // id: 3 是 Accepted
                    isAccepted ? "text-green-600" : "text-red-600"
                  }  
                  ${submissionsData.length === 0 && "hidden"}`}
                >
                  {isAccepted
                    ? "Accepted"
                    : submissionError?.status.description}
                </h2>
                {/* <pre className="text-sm text-muted-foreground ml-3">
                  Runtime: {data.time} ms
                </pre> */}
              </div>

              {submissionError && (
                <div className="bg-red-100  rounded-lg">
                  <div
                    className="text-rose-500 p-6"
                    dangerouslySetInnerHTML={{
                      __html: submissionError.stderr,
                    }}
                  />
                </div>
              )}

              {!submissionError && submissionsData.length != 0 && (
                <TestCaseList
                  problem={problem}
                  submissionsData={submissionsData}
                />
              )}
              {submissionsData.length === 0 && (
                <h2 className="text-white">沒有測試結果</h2>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Split>
      <EditorFooter handleExecution={handleExecution} />
    </div>
  );
};

export default Playground;
