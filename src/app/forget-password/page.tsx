"use client";

import { auth } from "@/firebase/firebase";
import React, { useEffect } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { AuthDialog } from "@/types/global";
import { ChevronLeft } from "lucide-react";
import { showSuccessToast } from "@/utils/Toast/message";
import { useRouter } from "next/navigation";
import TopBar from "@/components/Topbar";

const formSchema = z.object({
  email: z.string().email({ message: "email 格式錯誤" }),
});
type ResetPasswordProps = {
  setAuthDialog?: React.Dispatch<React.SetStateAction<AuthDialog>>;
};

const ForgetPassword: React.FC<ResetPasswordProps> = ({ setAuthDialog }) => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(auth);

  const handleReset = async (values: z.infer<typeof formSchema>) => {
    const success = await sendPasswordResetEmail(values.email);
    if (success) showSuccessToast("密碼重製信件已傳送");
  };

  useEffect(() => {
    if (error) {
      alert(error.message);
    }
  }, [error]);
  return (
    <>
      <TopBar isLoginBtnHidden={true} />
      <main className="grid grid-cols-4 grid-rows-4">
        <section className="col-start-2 col-span-2 row-start-2 row-span-2 p-2 flex flex-col space-y-5 border-4 mt-28 dark:border-none">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleReset)}
              className="space-y-4 w-full"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>email</FormLabel>
                    <FormControl>
                      <Input placeholder="studentid@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-3">
                <Button
                  size="icon"
                  type="button"
                  onClick={() => router.push("/login")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button className="w-full" type="submit">
                  重製密碼
                </Button>
              </div>
            </form>
          </Form>
        </section>
      </main>
    </>
  );
};
export default ForgetPassword;
