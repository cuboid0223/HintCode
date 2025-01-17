import React, { useState, useEffect } from "react";
import PreferenceNav from "./components/PreferenceNav";
import Split from "react-split";
import EditorFooter from "./components/EditorFooter";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  submitUserCodeForTesting,
  getSubmissionData,
} from "@/actions/testCodeAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseList from "./components/TestCaseList";
import { Submission, TestCase } from "@/types/testCase";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  submissionsState,
  SubmissionsState,
} from "@/atoms/submissionsDataAtom";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { problemDataState } from "@/atoms/ProblemData";
import { useSubscribedUserProblems } from "@/hooks/useGetUserProblems";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { showErrorToast, showWarningToast } from "@/utils/Toast/message";
import useGetProblems from "@/hooks/useGetProblems";
import { percentage } from "@/utils/percentage";
import { Languages, Settings } from "@/types/global";
import { useParams } from "next/navigation";
import { BEHAVIOR_IDS, WRONG_ANSWER_STATUS_ID } from "@/utils/const";
import { BehaviorsState, behaviorsState } from "@/atoms/behaviorsAtom";
import { userCodeState } from "@/atoms/userCodeAtom";
import { Problem, UserProblem } from "@/types/problem";

type PlaygroundProps = {
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

const TEST_CASE = "testcase";
const TEST_RESULT = "testResult";

const Playground: React.FC<PlaygroundProps> = ({ setSuccess }) => {
  const [user] = useAuthState(auth);
  const { pid } = useParams<{ pid: string }>();
  const { problems } = useGetProblems();
  const problem = useRecoilValue(problemDataState);
  const [behaviors, setBehaviors] =
    useRecoilState<BehaviorsState>(behaviorsState);

  const userProblems = useSubscribedUserProblems();
  const [lang, setLang] = useLocalStorage<Languages>("selectedLang", "py");
  // 最一次執行的程式碼
  const [localLatestTestCode, setLocalLatestTestCode] = useLocalStorage(
    `latest-test-${lang}-code-${user?.uid}`,
    ""
  );
  // playground 的程式碼
  const [localCurrentCode, setLocalCurrentCode] = useLocalStorage(
    `${lang}-code-${pid}-${user?.uid}`,
    ""
  );

  const { resolvedTheme } = useTheme();
  const [submissions, setSubmissions] =
    useRecoilState<SubmissionsState>(submissionsState);
  const [userCode, setUserCode] = useRecoilState(userCodeState);
  useRecoilState<SubmissionsState>(submissionsState);
  const [isLoading, setIsLoading] = useState(false);

  const [isAccepted, setIsAccepted] = useState(false);
  const [fontSize, setFontSize] = useLocalStorage(
    "playground-fontSize",
    "16px"
  );

  const [testTab, setTestTab] = useState(TEST_CASE);
  const [settings, setSettings] = useState<Settings>({
    fontSize: fontSize,
    settingsDialogIsOpen: false,
    dropdownIsOpen: false,
    selectedLang: lang as Languages,
  });
  const { selectedLang } = settings;

  const extractCode = (userCode: string, selectedLang: Languages) => {
    // 擷取第一個 function block
    // const pattern = /(?<!#)\bdef\s+\w+\s*\(.*?\)\s*:\s*\n(?:\s+.*(?:\n|$))+/;
    const Py_pattern =
      /(?<!#)\bdef\s+\w+\s*\(.*?\)\s*:\s*\n(?:\s+[\s\S]*(?:\n|$))+/;
    const VB_pattern = /Public Sub [\s\S]*?End Sub/;
    userCode = userCode.trim() + "\n\n"; // 多一些換行，讓隱藏程式碼可以執行

    const match = userCode.match(
      selectedLang === "py" ? Py_pattern : VB_pattern
    );
    if (match) return match[0];
    showErrorToast(
      `無法擷取 ${problem.starterFunctionName[selectedLang]} `,
      false
    );
    setIsLoading(false);
    return "";
  };

  const isFuncNameCorrect = (extractedCode: string) => {
    if (!extractedCode.includes(problem.starterFunctionName[selectedLang])) {
      showErrorToast(
        `函式名稱應是 ${problem.starterFunctionName[selectedLang]} `,
        false
      );
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const isCodeIncludesImport = (extractedCode: string) => {
    // 避免使用者在 function 內直接 import library
    if (extractedCode.includes("import")) {
      showErrorToast("不能導入未經允許的函式庫", false);
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const formatExecutableCodeByLanguage = (
    code: string,
    testCase: TestCase,
    lang: Languages
  ) => {
    switch (lang) {
      case "py":
        return `${code}\n${testCase.inputCode.trim()}`;
      case "vb":
        return `Public Module Program
    ${code}

    Public Sub Main()
      ${testCase.inputCode.trim()}
    End Sub
End Module`;
      default:
        throw new Error(`不支持 ${lang} 語言`);
    }
  };

  const handleExecution = async () => {
    if (!user) {
      showErrorToast("登入後才能執行程式");
      return;
    }
    if (localLatestTestCode === localCurrentCode) {
      showWarningToast("與之前執行的程式碼相同");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const extractedCode = extractCode(userCode, selectedLang);
    if (!isFuncNameCorrect(extractedCode)) return;
    if (!isCodeIncludesImport(extractedCode)) return;

    let temp: Submission[] = [];
    try {
      //  *** 這個未來需移除-------------
      const testCases = problem.testCode
        ? problem.testCode[selectedLang] // 這個保留
        : problem.testCaseCode;
      //  *** --------------------------
      for (const testCase of testCases) {
        const token: string = await submitUserCodeForTesting({
          userCode: formatExecutableCodeByLanguage(
            extractedCode,
            testCase,
            selectedLang
          ),
          expectedOutput: testCase.output,
          selectedLang: selectedLang,
        });
        if (!token) throw new Error("你忘記改 IP 了齁");

        const data = (await getSubmissionData(token)) as Submission;
        if (data?.stderr) {
          temp.push(data);
          // 代表使用者的 code 有語法上的錯誤
          throw new Error("當第一個測資發生語法錯誤後應停止後續的測資繼續進行");
        
        }
        // if (data?.status.id === WRONG_ANSWER_STATUS_ID) {
        //   temp.push(data);
        //   // 代表使用者的 code 有語法上的錯誤
        //   throw new Error("當某一個測資發生輸出錯誤後應停止後續的測資繼續進行");
        
        // }

        temp.push(data);
      }
    } catch (e) {
      if (e instanceof Error) {
        showErrorToast(e.message);
        console.log(e.message);
      }
    }

    setLocalLatestTestCode(userCode);
    setSubmissions(temp);
    setTestTab(TEST_RESULT);
    setIsLoading(false);
  };

  const onChange = (value: string) => {
    setUserCode(value);
    setLocalCurrentCode(value);
    setUserCode(value);
  };

  const handleTestTabChange = (value: string) => {
    setTestTab(value);
  };

  useEffect(() => {
    if (user && localCurrentCode) {
      setUserCode(localCurrentCode);
    } else {
      setUserCode(problem.starterCode[selectedLang]); // 設置題目程式碼初始值
    }
  }, [user, localCurrentCode, problem.starterCode, selectedLang, setUserCode]);

  useEffect(() => {
    // 確認是否全部測資都通過
    if (submissions.length === 0 || isLoading) return;
    const allTestsPassed = isAllTestCasesAccepted(submissions);
    const newBehaviorID = allTestsPassed
      ? BEHAVIOR_IDS.EXECUTION_SUCCESS // 4
      : BEHAVIOR_IDS.EXECUTION_FAILURE; // 5

    setBehaviors((prevBehaviors) => [...prevBehaviors, newBehaviorID]);

    setIsAccepted(allTestsPassed);
  }, [submissions]);

  useEffect(() => {
    if (!user || !problems || problems.length === 0) return;
    // 如果全部測資都通過且按了繳交按鈕 則重新計算使用者完成率
    const updateUserCompletionRate = async (
      solvedProblems: Problem[],
      publishedProblems: Problem[]
    ) => {
      if (isAllTestCasesAccepted(submissions)) {
        const userRef = doc(firestore, "users", user.uid);

        await updateDoc(userRef, {
          completionRate: percentage(
            solvedProblems.length,
            publishedProblems.length
          ),
        });
      }
    };

    const solvedUserProblems = userProblems.filter((p) => p.is_solved === true);
    const solvedPublishedProblems = problems.filter((p: Problem) =>
      solvedUserProblems.some((solved) => solved.id === p.id)
    );

    updateUserCompletionRate(solvedPublishedProblems, problems);
  }, [userProblems, user, submissions, problems]);

  useEffect(() => {
    const handleStorageUserCode = () => {
      if (user && localCurrentCode) {
        setUserCode(localCurrentCode);
      } else {
        setUserCode(problem.starterCode[selectedLang]);
      }
    };
    handleStorageUserCode();
  }, [user, localCurrentCode, problem.starterCode, selectedLang, setUserCode]);


  // useEffect(()=>{
  //   console.log(`行為: ${behaviors}`);
  // },[behaviors])

  return (
    <section className="hidden md:flex flex-col relative overflow-x-hidden ">
      <PreferenceNav
        settings={settings}
        setSettings={setSettings}
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
            resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-300"
          } `;
          return gutter;
        }}
      >
        {/*　Playground */}
        <div className="w-full overflow-auto">
          <Editor
            value={userCode}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            // defaultLanguage="python"
            language={selectedLang === "py" ? "python" : selectedLang}
            defaultValue=""
            onChange={onChange}
            options={{ fontSize: parseInt(settings.fontSize) }}
          />
        </div>

        <div className="h-full w-full overflow-auto ">
          {/* Tabs: testcase */}
          <Tabs
            className="h-full"
            value={testTab}
            defaultValue={TEST_CASE}
            onValueChange={handleTestTabChange}
          >
            <TabsList className="sticky top-0 z-20 grid w-full grid-cols-2 bg-card">
              <TabsTrigger
                value={TEST_CASE}
                className="relative hover:bg-muted transition-all"
              >
                <div className="text-sm font-medium text-foreground">
                  測試資料
                </div>
                {testTab === TEST_CASE && (
                  <motion.div
                    className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-400"
                    layoutId="underline"
                  />
                  // <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-400" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value={TEST_RESULT}
                className="relative hover:bg-muted transition-all"
              >
                <div className="text-sm font-medium leading-5 text-foreground">
                  測試結果
                </div>
                {testTab === TEST_RESULT && (
                  <motion.div
                    className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-400"
                    layoutId="underline"
                  />
                )}
              </TabsTrigger>
            </TabsList>
            {/* 測試範例視窗 */}
            <TabsContent value="testcase" className=" flex flex-col  px-3">
              {/* 測試資料區 */}
              <TestCaseList submissions={submissions} />
            </TabsContent>
            {/* 測試結果視窗 */}
            <TabsContent value={TEST_RESULT} className=" px-3 h-full">
              {submissions.length === 0 ? (
                <div className="h-full flex flex-col place-content-center	">
                  <h2 className=" text-white text-center  ">
                    試著按下執行按鈕
                  </h2>
                </div>
              ) : (
                <>
                  {/* 測試結果區 */}
                  <div className="flex items-center mb-3">
                    <h2
                      className={`font-bold  text-xl 
                  ${
                    // id: 3 是 Accepted
                    isAccepted ? "text-green-600" : "text-red-600"
                  }  
                  ${submissions.length === 0 && "hidden"}`}
                    >
                      {isAccepted ? "Accepted" : "Wrong Answer"}
                    </h2>
                  </div>
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
                    <TestCaseList isTestResult submissions={submissions} />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Split>
      {/* 執行按鈕 繳交按鈕 */}
      <EditorFooter
        handleExecution={handleExecution}
        isLoading={isLoading}
        setSuccess={setSuccess}
      />
    </section>
  );
};

export default Playground;
