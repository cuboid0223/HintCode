import { Message } from "@/types/message";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { showErrorToast, showWarningToast } from "@/utils/Toast/message";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { Send } from "lucide-react";
import { RingLoader } from "react-spinners";
import { Textarea } from "@/components/ui/textarea";

import { updateProblemRemainTimes } from "@/utils/problems/updateUserProblem";
import { useParams } from "next/navigation";
import {
  ASK_CUSTOM_QUESTION_PROMPT,
  BEHAVIOR_IDS,
  REVERSE_BEHAVIOR_IDS,
} from "@/utils/const";
import { BehaviorsState, behaviorsState } from "@/atoms/behaviorsAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useLocalStorage } from "@uidotdev/usehooks";

import createPromptTemplate from "@/utils/HelpTypes/createPromptTemplate";
import { problemDataState } from "@/atoms/ProblemData";
import { v4 as uuidv4 } from "uuid";
import { Submission } from "@/types/testCase";
import { FormSchema } from "@/utils/HelpTypes/FormSchemas";

import { Button } from "@/components/ui/button";
import { userCodeState } from "@/atoms/userCodeAtom";

type CustomInputFormProps = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isGPTTextReady: boolean;
  setIsGPTTextReady: Dispatch<SetStateAction<boolean>>;
  isHelpBtnDisable: boolean;
  isHidden: boolean;
  sendMessageToGPT: (
    prompt: string,
    threadId: string,
    setIsGPTTextReady: Dispatch<SetStateAction<boolean>>
  ) => Promise<void>;
  threadId: string;
};

const CustomInputForm: React.FC<CustomInputFormProps> = ({
  messages,
  setMessages,
  isGPTTextReady,
  setIsGPTTextReady,
  isHelpBtnDisable,
  sendMessageToGPT,
  isHidden,
  threadId,
}) => {
  const [user] = useAuthState(auth);
  const { pid } = useParams<{ pid: string }>();
  const problem = useRecoilValue(problemDataState);
  const userCode = useRecoilValue(userCodeState);
  const [behaviors, setBehaviors] =
    useRecoilState<BehaviorsState>(behaviorsState);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [selectedHelpType, setSelectedHelpType] = useState<number>(0);
  const [lang, setLang] = useLocalStorage("selectedLang", "py");

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!user) {
      showErrorToast("請先登入");
      return;
    }
    if (!data.customText || !data.customText.trim()) {
      showWarningToast("請輸入問題");
      return;
    }
    if (!selectedHelpType) {
      showWarningToast("請選擇問題標籤 ('下一步' 或是 '除錯')");
      return;
    }

    updateProblemRemainTimes(user?.uid, pid);
    processTextRequest(data);
    form.reset(); // 清空輸入框
  };

  const processTextRequest = (data: z.infer<typeof FormSchema>) => {
    data.code = userCode;
    data.prompt = ASK_CUSTOM_QUESTION_PROMPT;
    data.helpType = REVERSE_BEHAVIOR_IDS[selectedHelpType];
    const promptTemplate = createPromptTemplate(
      data,
      problem.problemStatement,
      problem.starterFunctionName[lang]
    );

    sendMessageToGPT(promptTemplate, threadId, setIsGPTTextReady);
    addUserMessage(data, null);
    setBehaviors([...behaviors, selectedHelpType]);
    setSelectedHelpType(null);
  };

  const addUserMessage = (
    data: z.infer<typeof FormSchema>,
    result: Submission[]
  ) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: uuidv4(),
        role: "user",
        code: data.code,
        created_at: Timestamp.now().toMillis(),
        result: result,
        text: data.customText,
      },
    ]);
  };

  return (
    <div className={`flex flex-col gap-2  ${isHidden && "hidden"}`}>
      {/* helpType 標籤選擇區 */}
      <section className="flex gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={
                  selectedHelpType === BEHAVIOR_IDS["NEXT_STEP"]
                    ? "default"
                    : "outline"
                }
                onClick={() => setSelectedHelpType(BEHAVIOR_IDS["NEXT_STEP"])}
              >
                下一步
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>詢問下一步如何進行，選擇此標籤不會附帶執行結果給 AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={
                  selectedHelpType === BEHAVIOR_IDS["DEBUG_ERROR"]
                    ? "default"
                    : "outline"
                }
                onClick={() => setSelectedHelpType(BEHAVIOR_IDS["DEBUG_ERROR"])}
              >
                除錯
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>詢問報錯問題，選擇此標籤會附帶執行結果給 AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
      {/* 輸入框 */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex w-full items-center`}
        >
          <FormField
            control={form.control}
            name="customText"
            render={({ field }) => (
              <FormItem className="flex-1">
                <Textarea
                  placeholder={
                    selectedHelpType === BEHAVIOR_IDS["DEBUG_ERROR"]
                      ? "請幫我除錯..."
                      : selectedHelpType === BEHAVIOR_IDS["NEXT_STEP"]
                        ? "我不知道下一步怎麼做..."
                        : "輸入問題"
                  }
                  value={field.value || ""}
                  onChange={field.onChange}
                />
                {/* <FormDescription>輸入問題... </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* submit button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="font-bold px-2 hover:-rotate-45 transform transition duration-300 h-full "
                type="submit"
                disabled={isHelpBtnDisable}
              >
                {isGPTTextReady ? (
                  <RingLoader color="#36d7b7" size={27} />
                ) : (
                  <Send />
                )}
              </TooltipTrigger>
              {isHelpBtnDisable && (
                <TooltipContent>
                  <p>您已通過所有測試資料或是提示次數已用完</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </form>
      </Form>
    </div>
  );
};

export default CustomInputForm;
