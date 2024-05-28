import { useState, useEffect, useRef } from "react";
import PreferenceNav from "./components/PreferenceNav";
import Split from "react-split";
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
import { useRecoilState } from "recoil";
import {
  submissionsDataState,
  SubmissionsDataState,
} from "@/atoms/submissionsDataAtom";
// import { mockSubmissions } from "@/mockProblems/mockSubmissions";
import { useTheme } from "next-themes";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { isHelpBtnEnableState } from "@/atoms/isHelpBtnEnableAtom";

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
  const latestTestCode = localStorage.getItem(`latest-test-py-code`) || ""; // 最後一次提交的程式碼
  const currentCode = localStorage.getItem(`py-code-${problem.id}`) || ""; // 指的是在 playground 的程式碼
  const { resolvedTheme } = useTheme();
  const [{ submissions }, setSubmissionsData] =
    useRecoilState<SubmissionsDataState>(submissionsDataState);
  const [isHelpBtnEnable, setIsHelpBtnEnable] =
    useRecoilState(isHelpBtnEnableState);

  const [isLoading, setIsLoading] = useState(false);
  let [userCode, setUserCode] = useState<string>(problem.starterCode.py);

  const [fontSize, setFontSize] = useLocalStorage("lcc-fontSize", "16px");

  const isAllTestCasesAccepted = submissions.every(
    // 全部測資都通過 isAllTestCasesAccepted 才會是 true
    (submission) => submission?.status.id === 3
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
        theme: resolvedTheme,
      });
      return;
    }
    if (latestTestCode === currentCode) {
      toast.warn("與之前的程式碼相同", {
        position: "top-center",
        autoClose: 3000,
        theme: resolvedTheme,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsHelpBtnEnable(true);
    let temp: SubmissionData[] = [];

    // 要測試 judge0 請打開
    if (selectedLang === "py") {
      checkStarterFunctionName(userCode);
      // handle python testCase
      userCode = userCode.slice(
        userCode.indexOf(problem.starterFunctionName.py)
      );

      try {
        for (const testCase of problem.testCaseCode) {
          const token = (await testUserCode({
            userCode: `${userCode.trim()}\n${testCase.inputCode.trim()}`,
            expectedOutput: testCase.output,
          })) as string;
          if (!token) {
            console.log("或許你用到流量上限了!!");
            throw new Error("或許你用到流量上限了!!");
          }

          const data = (await getSubmissionData(token)) as SubmissionData;
          if (data?.stderr) {
            temp.push(data);
            console.log("當第一個測資發生錯誤後應停止後續的測資繼續進行");
            throw new Error("當第一個測資發生錯誤後應停止後續的測資繼續進行");
          }
          temp.push(data);
        }
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      }
    }

    localStorage.setItem(
      `latest-test-${selectedLang}-code`,
      JSON.stringify(userCode)
    );
    setSubmissionsData({ problemId: problem.id, submissions: temp });
    // setSubmissionsData(mockSubmissions);
    setTestTab("testResult");
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("submissions: ", submissions);
    console.log("isAllTestCasesAccepted: ", isAllTestCasesAccepted);
  }, [submissions, isAllTestCasesAccepted]);

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
    <div className="flex flex-col relative overflow-x-hidden ">
      <PreferenceNav
        settings={settings}
        setSettings={setSettings}
        problem={problem}
        setUserCode={setUserCode}
      />

      <Split
        className="flex-1 overflow-hidden"
        direction="vertical"
        sizes={[60, 40]}
        minSize={60}
        gutter={(index, direction) => {
          const gutter = document.createElement("div");
          gutter.className = `gutter gutter-${direction} ${
            resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-300 "
          } `;
          return gutter;
        }}
      >
        {/*　Playground */}
        <div className="w-full overflow-auto">
          <Editor
            value={userCode}
            // height="90vh"
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            defaultLanguage="python"
            defaultValue=""
            onChange={onChange}
            options={{ fontSize: parseInt(settings.fontSize) }}
          />
          ;
        </div>

        <div className="w-full overflow-auto">
          {/* Tabs: testcase */}
          <Tabs
            className="flex flex-col "
            value={testTab}
            defaultValue="testcase"
            onValueChange={handleTestTabChange}
          >
            <TabsList className=" grid w-full grid-cols-2 bg-card">
              <TabsTrigger
                value="testcase"
                className="relative hover:bg-muted transition-all"
              >
                <div className="text-sm font-medium text-foreground">
                  測試資料
                </div>
                {testTab === "testcase" && (
                  <motion.div
                    className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-400"
                    layoutId="underline"
                  />
                  // <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-400" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="testResult"
                className="relative hover:bg-muted transition-all"
              >
                <div className="text-sm font-medium leading-5 text-foreground">
                  測試結果
                </div>
                {testTab === "testResult" && (
                  <motion.div
                    className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-400"
                    layoutId="underline"
                  />
                )}
              </TabsTrigger>
            </TabsList>
            {/* <ScrollArea className="flex bg-red-300"> */}
            <TabsContent value="testcase" className=" flex flex-col  px-3  ">
              {/* 測試資料區 */}
              <TestCaseList problem={problem} />
            </TabsContent>
            {/* </ScrollArea> */}
            <TabsContent value="testResult" className=" flex flex-col  px-3  ">
              {/* 測試結果區 */}
              <div className="flex items-center mb-3">
                <h2
                  className={`font-bold  text-xl 
                  ${
                    // id: 3 是 Accepted
                    isAllTestCasesAccepted ? "text-green-600" : "text-red-600"
                  }  
                  ${submissions.length === 0 && "hidden"}`}
                >
                  {isAllTestCasesAccepted ? "Accepted" : "Wrong Answer"}
                </h2>
              </div>
              {submissions.length === 0 ? (
                <h2 className="text-white">沒有測試結果</h2>
              ) : (
                <>
                  {submissions[0]?.stderr && (
                    <div className="bg-red-100 rounded-lg">
                      <div
                        className="text-rose-500 p-6"
                        dangerouslySetInnerHTML={{
                          __html: submissions[0].stderr,
                        }}
                      />
                    </div>
                  )}

                  {!submissions[0]?.stderr && (
                    <TestCaseList problem={problem} isTestResult />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Split>
      <EditorFooter handleExecution={handleExecution} isLoading={isLoading} />
    </div>
  );
};

export default Playground;
