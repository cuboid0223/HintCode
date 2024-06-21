import { AuthModal } from "@/utils/types/global";
import { auth } from "../../firebase/firebase";
import React, { useState, useEffect } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
      {/* <form
        className="space-y-6 px-6 lg:px-8 pb-4 sm:pb-6 xl:pb-8"
        onSubmit={handleReset}
      >
        <h3 className="text-xl font-medium  text-white">忘記密碼 ?</h3>
        <p className="text-sm text-white ">
          在下方輸入 e-mail, 我們會傳送重製密碼郵件給您
        </p>
        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium block mb-2 text-gray-300"
          >
            您的 email
          </label>
          <input
            type="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="name@company.com"
          />
        </div>

        <button
          type="submit"
          className={`w-full text-white  focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                `}
        >
          重製密碼
        </button>
      </form> */}

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
