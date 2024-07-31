"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import { Submission } from "@/types/testCase";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { ThemeType } from "../../../../types/global";
import { useTheme } from "next-themes";
import { Dispatch, useState, SetStateAction, useEffect } from "react";
import { isHelpBtnEnableState } from "@/atoms/isHelpBtnEnableAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import getWrongTestCases from "@/utils/testCases/getWrongTestCases";
import { problemDataState } from "@/atoms/ProblemData";
import { Message, Message as MessageType } from "../../../../types/message";
import { Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  submissionsState,
  SubmissionsState,
} from "@/atoms/submissionsDataAtom";
import { AssistantStream } from "openai/lib/AssistantStream";
// import useLocalStorage from "@/hooks/useLocalStorage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  DEBUG_ERROR,
  DEBUG_ERROR_PROMPT,
  HELP_TYPE_OPTIONS,
  NEXT_STEP,
  NEXT_STEP_PROMPT,
  PREV_HINT_NOT_HELP,
} from "../../../../../public/global";
import { getPromptByType } from "@/utils/HelpTypes/getTextByType";
import { showErrorToast, showWarningToast } from "@/utils/Toast/message";

const FormSchema = z.object({
  helpType: z.string({
    required_error: "您需要何種幫助",
  }),
  code: z.string().optional(),
  prompt: z.string().optional(),
  submissions: z.custom<SubmissionsState>(),
});

type SelectFormProps = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
  threadId: string;
  submissions: SubmissionsState;
};

export const SelectForm: React.FC<SelectFormProps> = ({
  messages,
  setMessages,
  threadId,
  submissions,
}) => {
  const [user] = useAuthState(auth);
  const problem = useRecoilValue(problemDataState);
  const [localLatestTestCode, setLocalLatestTestCode] = useLocalStorage(
    `latest-test-py-code`,
    ""
  );
  const [localCurrentCode, setLocalCurrentCode] = useLocalStorage(
    `py-code-${problem.id}`,
    ""
  );
  // const latestTestCode = localStorage.getItem(`latest-test-py-code`) || ""; // 最後一次提交的程式碼

  const { resolvedTheme } = useTheme();
  const params = useParams<{ pid: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [prevSubmitData, setPrevSubmitData] = useState(null);

  const [isHelpBtnEnable, setIsHelpBtnEnable] =
    useRecoilState(isHelpBtnEnableState);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const formatCode = (code: string) => {
    // 這裡要檢查 formatCode 到底輸出是啥
    return code
      .replace(/^\s*'''\s*/, "") // 移除開始的'''以及前面的空格
      .replace(/\s*'''$/, "") // 移除結尾的'''以及後面的空格
      .trim(); // 移除前後的空格
  };

  const formatSubmissions = (data: Submission[]) => {
    /*
    將測試資料的結果轉成純文字(自然語言)，方便 GPT 讀取
    */
    const formattedData = data.map((ele, id) => {
      const output = ele.stdout ? ele.stdout : "空";
      const error = ele.stderr ? ele.stderr : "空";
      const msg = ele.message ? ele.message : "空";
      const status = ele.status.description;
      return `
      測資${
        id + 1
      } : 其輸出為 ${output}，錯誤為 ${error}，訊息為 ${msg}，判斷為 ${status}
      `;
    });
    return formattedData;
  };

  const startLoading = () => {
    setIsLoading(true);
    setIsHelpBtnEnable(false);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!user) {
      showErrorToast("請先登入");
      return;
    }

    startLoading();

    console.log(data);
    // handleNextStep(data);
    // handleDebugError(data);
    // handlePrevHintNotHelp(data);
    processHelpRequest(data);
    stopLoading();
  };

  const processHelpRequest = (data: z.infer<typeof FormSchema>) => {
    switch (data.helpType) {
      case NEXT_STEP:
        handleNextStep(data);
        break;
      case DEBUG_ERROR:
        handleDebugError(data, submissions);
        break;
      case PREV_HINT_NOT_HELP:
        handlePrevHintNotHelp();
        break;
      default:
        console.error("Unknown help type:", data.helpType);
    }
  };

  const handleNextStep = (data: z.infer<typeof FormSchema>) => {
    data.code = localCurrentCode;
    data.prompt = NEXT_STEP_PROMPT;
    const promptTemplate = createPromptTemplate(data, problem.problemStatement);
    sendMessageToGPT(promptTemplate);
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
    // data.submissions = submissions;
    data.prompt = DEBUG_ERROR_PROMPT;
    const promptTemplate = createPromptTemplate(
      data,
      problem.problemStatement,
      submissions
    );
    sendMessageToGPT(promptTemplate);
    addUserMessage(data, submissions);
  };

  const handlePrevHintNotHelp = () => {
    const prevMessage = getPreviousUserMessage();
    if (!prevMessage) {
      showErrorToast("沒有上一個提示");
      return;
    }
    const tmp = {
      helpType: prevMessage.type,
      code: prevMessage.code,
      prompt: getPromptByType(prevMessage.type),
      submissions: prevMessage.result,
    };
    processHelpRequest(tmp);
  };

  const getPreviousUserMessage = () => {
    const lastUserMessage = messages[messages.length - 2];
    return lastUserMessage ? lastUserMessage : null;
  };

  const createPromptTemplate = (
    data: z.infer<typeof FormSchema>,
    problemStatement: string,
    submissions = null
  ) => {
    return `
    題目如下:
=========problem statement start========
    ${problemStatement}
=========problem statement end==========

    以下是我目前的程式碼:
==========code start==========

    ${formatCode(data.code)}

===========code end===========

    ${
      submissions
        ? `以下是我的程式經過測試後的輸出
==========test start==========
    ${formatSubmissions(submissions)}
==========test end==========
    `
        : ""
    }
    ${data.prompt}
  `;
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

  const sendMessageToGPT = async (text: string) => {
    if (!threadId) {
      console.log("no thread id");
    }
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    // 在使用者傳程式碼之前，assistant message 是先被建立的，所以整個 array 需要 revert
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
      setFinalText((prevText) => prevText + delta.value);
    }
    // if (delta.annotations != null) {
    //   annotateLastMessage(delta.annotations);
    // }
  };
  /*
    =======================
    === Utility Helpers ===
    =======================
  */
  const appendMessage = (role: string, text: string) => {
    console.log(text);
    setMessages(
      (prevMessages) =>
        [
          ...prevMessages,
          { role, text, id: uuidv4(), created_at: Timestamp.now().toMillis() },
        ] as MessageType[]
    );
  };

  const appendToLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };

      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="absolute bottom-0 left-0 p-3 z-50 flex w-full items-center space-x-2 bg-card "
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
              // hidden={isHelpBtnHidden}
              // disabled={isLoading || !isHelpBtnEnable}
            >
              {isLoading ? <RingLoader color="#36d7b7" size={27} /> : "傳送"}
            </TooltipTrigger>
            <TooltipContent>
              {isAllTestCasesAccepted(submissions) ? (
                <p>您已通過測試</p>
              ) : (
                <p>需要按下執行按鈕產生結果</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
    </Form>
  );
};
