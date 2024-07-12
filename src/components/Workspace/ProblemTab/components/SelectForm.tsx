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
import { SubmissionData } from "@/utils/types/testCase";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { ThemeType } from "@/utils/types/global";
import { useTheme } from "next-themes";
import { Dispatch, useState, SetStateAction, useEffect } from "react";
import { isHelpBtnEnableState } from "@/atoms/isHelpBtnEnableAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import getWrongTestCases from "@/utils/testCases/getWrongTestCases";
import { problemDataState } from "@/atoms/ProblemData";
import { Message as MessageType } from "@/utils/types/message";
import { Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { SubmissionsDataState } from "@/atoms/submissionsDataAtom";
import { AssistantStream } from "openai/lib/AssistantStream";

const FormSchema = z.object({
  helpType: z.string({
    required_error: "Please select an helpType to display.",
  }),
  code: z.string().optional(),
  prompt: z.string().optional(),
});

type SelectFormProps = {
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
  threadId: string;
  submissionsData: SubmissionsDataState;
};

const NEXT_STEP = "nextStep";
const DEBUG_ERROR = "debugError";
const NEXT_STEP_PROMPT =
  "請告訴我下一步怎麼做，但請不要透漏正確且完整解法讓我複製，給我的範例程式碼不能是題目的答案，這可以幫助我思考其中的概念。不需要給我應用到我的問題或範例的程式碼";
const DEBUG_ERROR_PROMPT =
  "請不要跟我講答案，只需要透過提供類似情境和變數名稱的範例程式碼告訴我哪裡出錯了。";

const HELP_TYPE_MAP = {
  [NEXT_STEP]: "我不知道下一步要怎麼做",
  [DEBUG_ERROR]: "輸出報錯了，哪裡有問題?",
};

export const SelectForm: React.FC<SelectFormProps> = ({
  setMessages,
  threadId,
  submissionsData,
}) => {
  const latestTestCode = localStorage.getItem(`latest-test-py-code`) || ""; // 最後一次提交的程式碼
  const problem = useRecoilValue(problemDataState);
  const { resolvedTheme } = useTheme();
  const params = useParams<{ pid: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [finalText, setFinalText] = useState("");
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

  const formatSubmissions = (data: SubmissionData[]) => {
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

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setIsHelpBtnEnable(false);
    data["code"] = localStorage.getItem(`py-code-${params.pid}`);
    console.log(data);
    handleNextStep(data);
    handleDebugError(data);

    // setUserInput("");
    // setInputDisabled(true);
    // scrollToBottom();
    setIsLoading(false);
  };

  const handleNextStep = (data: z.infer<typeof FormSchema>) => {
    if (data.helpType === NEXT_STEP) {
      data["prompt"] = NEXT_STEP_PROMPT;
      const promptTemplate = `
    題目如下:
=========problem statement start========
    ${problem.problemStatement}
=========problem statement end==========
    
    以下是我目前的程式碼:
==========code start==========

    ${formatCode(data.code)}

===========code end===========

    ${data.prompt}
    `;
      sendMessageToGPT(promptTemplate);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          role: "user",
          code: data.code,
          created_at: Timestamp.now().toMillis(),
          result: null,
          text: data.prompt,
          type: data.helpType,
        },
      ]);
    }
  };

  const handleDebugError = (data: z.infer<typeof FormSchema>) => {
    if (data.helpType === DEBUG_ERROR) {
      if (submissionsData.submissions.length === 0) {
        toast.warn("沒有執行結果，請按下執行按鈕", {
          position: "top-center",
          autoClose: 3000,
          theme: resolvedTheme as ThemeType,
        });
        return;
      }
      data["submissions"] = submissionsData.submissions;
      data["prompt"] = DEBUG_ERROR_PROMPT;
    }
  };
  //   const handleSubmit = (data: z.infer<typeof FormSchema>) => {
  //     // if (!userInput.trim()) return;
  //     // if (!latestTestCode || !wrongTestCases) {
  //     //   toast.warn("沒有測試結果，請按執行按鈕", {
  //     //     position: "top-center",
  //     //     autoClose: 3000,
  //     //     theme: resolvedTheme as ThemeType,
  //     //   });
  //     //   setIsLoading(false);
  //     //   return;
  //     // }
  //     // 請不要輕易試著更改下方所有字串，包含空格或是格式化
  //     const promptTemplate = `
  //     題目如下:
  // =========problem statement start========
  //     ${problem.problemStatement}
  // =========problem statement end==========

  //     以下是我的程式碼:
  // ==========code start==========

  //     ${formatCode(latestTestCode)}

  // ===========code end===========

  //     以下是經過測試後的輸出:
  // =========test output start=======
  //     ${formatSubmissions(wrongTestCases)}
  // =========test output end=========

  //     ${data.prompt}
  //     `;

  //     sendMessageToGPT(promptTemplate);
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         id: uuidv4(),
  //         role: "user",
  //         code: latestTestCode,
  //         created_at: Timestamp.now().toMillis(),
  //         result: submissionsData,
  //         text: `
  // ==========code start==========

  //     ${formatCode(latestTestCode)}

  // ===========code end===========
  //       `,
  //       },
  //     ]);

  //     // setUserInput("");
  //     // setInputDisabled(true);
  //     // scrollToBottom();
  //     setIsLoading(false);
  //   };
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

  const annotateLastMessage = () => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };

      // annotations.forEach((annotation) => {
      //   if (annotation.type === "file_path") {
      //     updatedLastMessage.text = updatedLastMessage.text.replaceAll(
      //       annotation.text,
      //       `/api/files/${annotation.file_path.file_id}`
      //     );
      //   }
      // });
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
                  {Object.entries(HELP_TYPE_MAP).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
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
              {isAllTestCasesAccepted(submissionsData?.submissions) ? (
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
