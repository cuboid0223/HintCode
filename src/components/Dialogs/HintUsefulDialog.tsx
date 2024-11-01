import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { doc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams, useRouter } from "next/navigation";
import { RADIO_VALUE } from "@/utils/const";
import useGetProblems from "@/hooks/useGetProblems";

const formSchema = z.object({
  useful: z.string(),
  advice: z.string().max(200),
});

type HintUsefulDialogProps = {
  isHintUsefulDialogOpen: boolean;
  setIsHintUsefulDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  isHelpEnabled: boolean;
};

const HintUsefulDialog: React.FC<HintUsefulDialogProps> = ({
  isHintUsefulDialogOpen,
  setIsHintUsefulDialogOpen,
  setSuccess,
  isHelpEnabled,
}) => {
  const router = useRouter();
  const { problems, handleProblemChange } = useGetProblems();
  const [user] = useAuthState(auth);
  const params = useParams<{ pid: string }>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      advice: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const userProblemRef = doc(
      firestore,
      "users",
      user?.uid,
      "problems",
      params.pid
    );

    updateDoc(userProblemRef, {
      // 因為 里克特量表跑統計 普通 -> 3 故加一
      useful: RADIO_VALUE.findIndex((v) => v === values.useful) + 1,
      advice: values.advice,
    });
    setSuccess(false);
    setIsHintUsefulDialogOpen(!isHintUsefulDialogOpen);
    // 前往主頁面，觸發解鎖
    handleProblemChange(true, user?.uid);
  };

  return (
    <div>
      {/* 在按下繳交按鈕時 顯示 */}
      <Dialog open={isHintUsefulDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          //   isDialogOverlayHidden
          isCloseIconHidden
          aria-describedby={undefined}
        >
          <DialogTitle className="">
            恭喜你通過此題，根據此題 HintCode 提供給你的提示，你覺得...
          </DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="useful"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>該題提供的提示對於我是有幫助的</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {RADIO_VALUE.map((value, index) => (
                          <FormItem
                            className="flex items-center space-x-3 space-y-0"
                            key={index}
                          >
                            <FormControl>
                              <RadioGroupItem value={value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {value}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="advice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> 想給予 HintCode 的建議 : </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="我覺得..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {/* You can <span>@mention</span> other users and
                      organizations. */}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">繳交，並前往下一題</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HintUsefulDialog;
