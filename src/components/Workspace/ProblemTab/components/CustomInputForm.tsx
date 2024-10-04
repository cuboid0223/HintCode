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
import { showErrorToast } from "@/utils/Toast/message";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { Send } from "lucide-react";
import { RingLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { updateProblemRemainTimes } from "@/utils/problems/updateUserProblem";
import { useParams } from "next/navigation";
import { ASK_CUSTOM_QUESTION_PROMPT, BEHAVIOR_IDS } from "@/utils/const";
import { BehaviorsState, behaviorsState } from "@/atoms/behaviorsAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Languages } from "@/types/global";
import { SubmissionsState } from "@/atoms/submissionsDataAtom";
import createPromptTemplate from "@/utils/HelpTypes/createPromptTemplate";
import { problemDataState } from "@/atoms/ProblemData";
import sendMessageToGPT from "@/utils/HelpTypes/sendMessageToGPT";
import { v4 as uuidv4 } from "uuid";
import { Submission } from "@/types/testCase";

type CustomInputFormProps = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isGPTTextReady: boolean;
  setIsGPTTextReady: Dispatch<SetStateAction<boolean>>;
  isHelpBtnDisable: boolean;
  isHidden: boolean;
  threadId: string;
};

// const FormSchema = z.object({
//   text: z
//     .string({
//       required_error: "請輸入問題",
//     })
//     .trim(),
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

const CustomInputForm: React.FC<CustomInputFormProps> = ({
  messages,
  setMessages,
  isGPTTextReady,
  setIsGPTTextReady,
  isHelpBtnDisable,
  isHidden,
  threadId,
}) => {
  const [user] = useAuthState(auth);
  const { pid } = useParams<{ pid: string }>();
  const problem = useRecoilValue(problemDataState);
  const [behaviors, setBehaviors] =
    useRecoilState<BehaviorsState>(behaviorsState);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [finalText, setFinalText] = useState("");
  const [lang, setLang] = useLocalStorage("selectedLang", "py");
  const [localCurrentCode, setLocalCurrentCode] = useLocalStorage(
    `${lang}-code-${pid}-${user?.uid}`,
    ""
  );

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!user) {
      showErrorToast("請先登入");
      return;
    }
    if (!data.text.trim()) {
      showErrorToast("請輸入問題");
      return;
    }

    updateProblemRemainTimes(user?.uid, pid);
    processTextRequest(data);
  };

  const processTextRequest = (data: z.infer<typeof FormSchema>) => {
    data.code = localCurrentCode;
    console.log(data.code);
    data.prompt = ASK_CUSTOM_QUESTION_PROMPT;
    const promptTemplate = createPromptTemplate(data, problem.problemStatement);

    sendMessageToGPT(
      promptTemplate,
      threadId,
      setIsGPTTextReady,
      handleTextCreated,
      handleTextDelta
    );
    addUserMessage(data, null);
    setBehaviors([...behaviors, BEHAVIOR_IDS.ASK_CUSTOM_QUESTION]);
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
        text: data.text,
      },
    ]);
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
  };
  /*
    =======================
    === Utility Helpers ===
    =======================
  */
  const appendMessage = (role: string, text: string) => {
    // console.log(text);
    setMessages(
      (prevMessages) =>
        [
          ...prevMessages,
          { role, text, id: uuidv4(), created_at: Timestamp.now().toMillis() },
        ] as Message[]
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
        className={`flex w-full items-center p-2 bg-card ${isHidden && "hidden"}`}
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1">
              <Input type="text" placeholder="輸入問題..." {...field} />
              {/* <FormDescription>輸入問題... </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        {/* submit button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="font-bold px-2"
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

export default CustomInputForm;
