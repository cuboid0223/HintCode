import { auth } from "../../firebase/firebase";
import React, { useEffect } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { useTheme } from "next-themes";

const formSchema = z.object({
  email: z.string().email({ message: "email 格式錯誤" }),
});

const ResetPassword = () => {
  const { resolvedTheme } = useTheme();
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
    if (success) {
      toast.success("密碼重製信件已傳送", {
        position: "top-center",
        autoClose: 3000,
        theme: resolvedTheme,
      });
    }
  };

  useEffect(() => {
    if (error) {
      alert(error.message);
    }
  }, [error]);
  return (
    <section className="p-2 flex flex-col space-y-5 border-4 mt-28 dark:border-none">
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

          <Button className="w-full" type="submit">
            重製密碼
          </Button>
        </form>
      </Form>
    </section>
  );
};
export default ResetPassword;
