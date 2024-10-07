import { Message } from "@/types/message";
import React, { Dispatch, SetStateAction } from "react";
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

import createPromptTemplate from "@/utils/HelpTypes/createPromptTemplate";
import { problemDataState } from "@/atoms/ProblemData";
import { v4 as uuidv4 } from "uuid";
import { Submission } from "@/types/testCase";
import { FormSchema } from "@/utils/HelpTypes/FormSchemas";

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
  const [behaviors, setBehaviors] =
    useRecoilState<BehaviorsState>(behaviorsState);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

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
    if (!data.customText.trim()) {
      showErrorToast("請輸入問題");
      return;
    }

    updateProblemRemainTimes(user?.uid, pid);
    processTextRequest(data);
    form.reset(); // 清空輸入框
  };

  const processTextRequest = (data: z.infer<typeof FormSchema>) => {
    data.code = localCurrentCode;
    data.prompt = ASK_CUSTOM_QUESTION_PROMPT;
    const promptTemplate = createPromptTemplate(
      data,
      problem.problemStatement,
      problem.starterFunctionName[lang]
    );

    sendMessageToGPT(promptTemplate, threadId, setIsGPTTextReady);
    addUserMessage(data, null);
    // setBehaviors([...behaviors, BEHAVIOR_IDS.ASK_CUSTOM_QUESTION]);
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex w-full items-center p-2 bg-card ${isHidden && "hidden"}`}
      >
        <FormField
          control={form.control}
          name="customText"
          render={({ field }) => (
            <FormItem className="flex-1">
              <Input
                type="text"
                placeholder="輸入問題..."
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
