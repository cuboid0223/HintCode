import { useState, useEffect } from "react";
import PreferenceNav from "./components/PreferenceNav";
import Split from "react-split";
import EditorFooter from "./components/EditorFooter";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/firebase";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { useLocalStorage } from "@uidotdev/usehooks";
import { testUserCode, getSubmissionData } from "@/actions/testCodeAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseList from "./components/TestCaseList";
import { Submission } from "@/types/testCase";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  submissionsState,
  SubmissionsState,
} from "@/atoms/submissionsDataAtom";
import { useTheme } from "next-themes";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { isHelpBtnEnableState } from "@/atoms/isHelpBtnEnableAtom";
import { problemDataState } from "@/atoms/ProblemData";
import useGetUserProblems, {
  useSubscribedUserProblems,
} from "@/hooks/useGetUserProblems";
import { isPersonalInfoDialogOpenState } from "@/atoms/isPersonalInfoDialogOpen";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { ThemeType } from "../../../types/global";

type PlaygroundProps = {
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

export type Settings = {
  fontSize: string;
  settingsDialogIsOpen: boolean;
  dropdownIsOpen: boolean;
  selectedLang: "py" | "js";
};

const Playground: React.FC<PlaygroundProps> = ({ setSuccess, setSolved }) => {
  const [user] = useAuthState(auth);
  const problem = useRecoilValue(problemDataState);
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] =
    useRecoilState(isPersonalInfoDialogOpenState);
  const userProblems = useSubscribedUserProblems();
  // 最後一次執行的程式碼
  const [localLatestTestCode, setLocalLatestTestCode] = useLocalStorage(
    `latest-test-py-code`,
    ""
  );
  // playground 的程式碼
  const [localCurrentCode, setLocalCurrentCode] = useLocalStorage(
    `py-code-${problem.id}`,
    ""
  );

  const { resolvedTheme } = useTheme();
  const [submissions, setSubmissions] =
    useRecoilState<SubmissionsState>(submissionsState);
  const [isHelpBtnEnable, setIsHelpBtnEnable] =
    useRecoilState(isHelpBtnEnableState);

  const [isLoading, setIsLoading] = useState(false);
  let [userCode, setUserCode] = useState<string>(problem.starterCode.py);
  const [isAccepted, setIsAccepted] = useState(false);
  const [fontSize, setFontSize] = useLocalStorage("lcc-fontSize", "16px");

  const [testTab, setTestTab] = useState("testcase");
  const [settings, setSettings] = useState<Settings>({
    fontSize: fontSize,
    settingsDialogIsOpen: false,
    dropdownIsOpen: false,
    selectedLang: "py",
  });
  const { selectedLang } = settings;

  const extractCode = (userCode: string) => {
    // 擷取第一個 function
    const pattern = /(def \w+\(.*\):\n(?:\s*.*\n)+?)\n/;
    const match = userCode.match(pattern);
    if (match) return match[0];

    toast.error(
      `函式名稱必須是 ${problem.starterFunctionName[selectedLang]} `,
      {
        position: "top-center",
        autoClose: false,
        theme: "dark",
      }
    );
    setIsLoading(false);
    return "";
  };

  const isFuncNameCorrect = (extractedCode: string) => {
    if (!extractedCode.includes(problem.starterFunctionName[selectedLang])) {
      toast.error(
        `函式名稱必須是 ${problem.starterFunctionName[selectedLang]} `,
        {
          position: "top-center",
          autoClose: false,
          theme: "dark",
        }
      );
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const handleExecution = async () => {
    if (!user) {
      toast.error("登入後才能執行程式", {
        position: "top-center",
        autoClose: 3000,
        theme: resolvedTheme as ThemeType,
      });
      return;
    }
    if (localLatestTestCode === localCurrentCode) {
      toast.warn("與之前執行的程式碼相同", {
        position: "top-center",
        autoClose: 3000,
        theme: resolvedTheme as ThemeType,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsHelpBtnEnable(false);
    const extractedCode = extractCode(userCode);
    if (!isFuncNameCorrect(extractedCode)) return;
    let temp: Submission[] = [];
    try {
      for (const testCase of problem.testCaseCode) {
        console.log(testCase.inputCode.trim());
        console.log(`${extractedCode}\n${testCase.inputCode.trim()}`);
        const token: string = await testUserCode({
          userCode: `${extractedCode}\n${testCase.inputCode.trim()}`,
          expectedOutput: testCase.output,
        });
        if (!token) throw new Error("或許你用到流量上限了!!");

        const data = (await getSubmissionData(token)) as Submission;
        if (data?.stderr) {
          temp.push(data);
          throw new Error("當第一個測資發生錯誤後應停止後續的測資繼續進行");
        }
        temp.push(data);
      }
    } catch (e) {
      if (e instanceof Error) console.log(e.message);
    }

    setLocalLatestTestCode(userCode);
    setSubmissions(temp);
    setTestTab("testResult");
    setIsLoading(false);
    setIsHelpBtnEnable(true);
  };

  const onChange = (value: string) => {
    setUserCode(value);
    setLocalCurrentCode(value);
  };

  const handleTestTabChange = (value: string) => {
    setTestTab(value);
  };

  useEffect(() => {
    // 確認是否全部測資都通過
    if (submissions.length === 0) return;
    setIsAccepted(isAllTestCasesAccepted(submissions));
  }, [submissions]);

  useEffect(() => {
    // 如果全部測資都通過且按了繳交按鈕 則重新計算使用者總分

    const updateUserTotalScore = async () => {
      if (!user) return;
      const solvedProblems = userProblems.filter((p) => p.is_solved === true);
      console.log("solvedProblems: ", solvedProblems);
      console.log(
        "我在外面",
        isAllTestCasesAccepted(submissions),
        solvedProblems
      );
      if (isAllTestCasesAccepted(submissions) && solvedProblems.length !== 0) {
        console.log("我進來了");
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, {
          // reduce 加總陣列裡的分數
          totalScore: solvedProblems.reduce((acc, p) => acc + p.score, 0),
        });
      }
    };

    updateUserTotalScore();
  }, [userProblems, user, submissions]);

  useEffect(() => {
    if (user && localCurrentCode) {
      setUserCode(localCurrentCode);
    } else {
      setUserCode(problem.starterCode.py);
    }
  }, [problem.id, user, problem.starterCode.py, localCurrentCode]);

  return (
    <div className="flex flex-col relative overflow-x-hidden ">
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
            resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-300 "
          } `;
          return gutter;
        }}
      >
        {/*　Playground */}
        <div className="w-full overflow-auto">
          <Editor
            value={userCode}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            defaultLanguage="python"
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
            defaultValue="testcase"
            onValueChange={handleTestTabChange}
          >
            <TabsList className="sticky top-0 z-10 grid w-full grid-cols-2 bg-card ">
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
            <TabsContent value="testcase" className=" flex flex-col  px-3">
              {/* 測試資料區 */}
              <TestCaseList submissions={submissions} />
            </TabsContent>
            <TabsContent value="testResult" className=" px-3 h-full">
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
      <EditorFooter
        handleExecution={handleExecution}
        isLoading={isLoading}
        setSuccess={setSuccess}
      />
    </div>
  );
};

export default Playground;
