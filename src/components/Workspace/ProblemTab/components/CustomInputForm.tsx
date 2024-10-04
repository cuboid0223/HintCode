import { Message } from "@/types/message";
import React, { Dispatch, SetStateAction } from "react";
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
import { showErrorToast } from "@/utils/Toast/message";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { Send } from "lucide-react";
import { RingLoader } from "react-spinners";
import { SubmissionsState } from "@/atoms/submissionsDataAtom";
import { Input } from "@/components/ui/input";

type CustomInputFormProps = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isGPTTextReady: boolean;
  setIsGPTTextReady: Dispatch<SetStateAction<boolean>>;
  isHelpBtnDisable: boolean;
  isHidden: boolean;
};

const FormSchema = z.object({
  text: z.string({
    required_error: "您需要何種幫助",
  }),
  code: z.string().optional(),
  prompt: z.string().optional(),
  submissions: z.custom<SubmissionsState>(),
});

const CustomInputForm: React.FC<CustomInputFormProps> = ({
  messages,
  setMessages,
  isGPTTextReady,
  setIsGPTTextReady,
  isHelpBtnDisable,
  isHidden,
}) => {
  const [user] = useAuthState(auth);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!user) {
      showErrorToast("請先登入");
      return;
    }
    console.log(data);
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
