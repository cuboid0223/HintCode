"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RingLoader } from "react-spinners";
import { Submission } from "@/types/testCase";
import { useParams } from "next/navigation";
import { Dispatch, useState, SetStateAction } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";
import { Message } from "@/types/message";
import { Timestamp } from "firebase/firestore";

import { SubmissionsState } from "@/atoms/submissionsDataAtom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  BEHAVIOR_IDS,
  DEBUG_ERROR,
  DEBUG_ERROR_PROMPT,
  HELP_TYPE_OPTIONS,
  NEXT_STEP,
  NEXT_STEP_PROMPT,
  PREV_HINT_NOT_HELP,
} from "@/utils/const";
import { getPromptByType } from "@/utils/HelpTypes/getTextByType";
import { showErrorToast, showWarningToast } from "@/utils/Toast/message";
import { updateProblemRemainTimes } from "@/utils/problems/updateUserProblem";
import { Send } from "lucide-react";
import { Languages } from "@/types/global";
import { BehaviorsState, behaviorsState } from "@/atoms/behaviorsAtom";
import createPromptTemplate from "@/utils/HelpTypes/createPromptTemplate";
import { v4 as uuidv4 } from "uuid";

// const FormSchema = z.object({
//   helpType: z.string({
//     required_error: "您需要何種幫助",
//   }),
//   code: z.string().optional(),
//   prompt: z.string().optional(),
//   submissions: z.custom<SubmissionsState>(),
// });
const FormSchema = z
  .object({
    helpType: z
      .string({
        required_error: "您需要何種幫助",
      })
      .optional(),
    text: z
      .string({
        required_error: "請輸入問題",
      })
      .trim()
      .optional(),
    code: z.string().optional(),
    prompt: z.string().optional(),
    submissions: z.custom<SubmissionsState>(),
  })
  .refine(
    (data) => {
      return (data.helpType && !data.text) || (!data.helpType && data.text);
    },
    {
      message: "必須提供 helpType 或 text 其中之一",
      path: ["helpType", "text"],
    }
  );

type SelectFormProps = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isGPTTextReady: boolean;
  setIsGPTTextReady: Dispatch<SetStateAction<boolean>>;
  isHelpBtnDisable: boolean;
  threadId: string;
  submissions: SubmissionsState;
  sendMessageToGPT: (
    prompt: string,
    threadId: string,
    setIsGPTTextReady: Dispatch<SetStateAction<boolean>>
  ) => Promise<void>;
  isHidden: boolean;
};

export const SelectForm: React.FC<SelectFormProps> = ({
  messages,
  setMessages,
  isGPTTextReady,
  setIsGPTTextReady,
  isHelpBtnDisable,
  threadId,
  submissions,
  sendMessageToGPT,
  isHidden,
}) => {
  const [user] = useAuthState(auth);
  const { pid } = useParams<{ pid: string }>();
  const [behaviors, setBehaviors] =
    useRecoilState<BehaviorsState>(behaviorsState);
  const problem = useRecoilValue(problemDataState);
  const [lang, setLang] = useLocalStorage<Languages>("selectedLang", "py");
  const [localLatestTestCode, setLocalLatestTestCode] = useLocalStorage(
    `latest-test-${lang}-code-${user?.uid}`,
    ""
  );
  const [localCurrentCode, setLocalCurrentCode] = useLocalStorage(
    `${lang}-code-${pid}-${user?.uid}`,
    ""
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!user) {
      showErrorToast("請先登入");
      return;
    }
    updateProblemRemainTimes(user?.uid, pid);
    processHelpRequest(data);
  };

  const processHelpRequest = (data: z.infer<typeof FormSchema>) => {
    switch (data.helpType) {
      case NEXT_STEP:
        setBehaviors([...behaviors, BEHAVIOR_IDS.NEXT_STEP]);
        handleNextStep(data);
        break;
      case DEBUG_ERROR:
        setBehaviors([...behaviors, BEHAVIOR_IDS.DEBUG_ERROR]);
        handleDebugError(data, submissions);
        break;
      case PREV_HINT_NOT_HELP:
        // setBehaviors([...behaviors, BEHAVIOR_IDS.PREV_HINT_NOT_HELP]);
        handlePrevHintNotHelp();
        break;
      default:
        console.error("Unknown help type:", data.helpType);
    }
  };

  const handleNextStep = (data: z.infer<typeof FormSchema>) => {
    data.code = localCurrentCode;
    data.prompt = NEXT_STEP_PROMPT;
    const finalPrompt = createPromptTemplate(
      data,
      problem.problemStatement,
      problem.starterFunctionName[lang]
    );

    sendMessageToGPT(finalPrompt, threadId, setIsGPTTextReady);
    addUserMessage(data, null);
  };

  const handleDebugError = (
    data: z.infer<typeof FormSchema>,
    submissions: SubmissionsState
  ) => {
    const currentSubmissions = data.submissions || submissions;
    if (!currentSubmissions || currentSubmissions.length === 0) {
      showWarningToast("沒有執行結果，請按下執行按鈕");
      return;
    }
    data.code = localLatestTestCode;
    data.prompt = DEBUG_ERROR_PROMPT;
    const promptTemplate = createPromptTemplate(
      data,
      problem.problemStatement,
      problem.starterFunctionName[lang],
      submissions
    );

    sendMessageToGPT(promptTemplate, threadId, setIsGPTTextReady);
    addUserMessage(data, submissions);
  };

  const handlePrevHintNotHelp = () => {
    const prevMessage = getPreviousUserMessage();
    if (!prevMessage) {
      showErrorToast("沒有上一個提示");
      return;
    }
    const prevData = {
      helpType: prevMessage.type,
      code: prevMessage.code,
      prompt: getPromptByType(prevMessage.type),
      submissions: prevMessage.result,
    };

    processHelpRequest(prevData);
  };

  const getPreviousUserMessage = () => {
    const lastUserMessage = messages[messages.length - 2];
    return lastUserMessage ? lastUserMessage : null;
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
        type: data.helpType,
      },
    ]);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex w-full items-center space-x-2 bg-card ${isHidden && "hidden"}`}
      >
        <FormField
          control={form.control}
          name="helpType"
          render={({ field }) => (
            <FormItem className="flex-1">
              {/* <FormLabel>Email</FormLabel> */}
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="幫助類型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {HELP_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.type} value={option.type}>
                      {option.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                選擇你想尋求幫助的類型
                {/* <Link href="/examples/forms">email settings</Link>. */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="font-bold mr-3"
              type="submit"
              disabled={isHelpBtnDisable}
            >
              {isGPTTextReady ? (
                <RingLoader color="#36d7b7" size={27} />
              ) : (
                <Send />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {isHelpBtnDisable && (
                <p>您已通過所有測試資料或是提示次數已用完</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
    </Form>
  );
};
