"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  UserCredential,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/utils/Toast/message";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/Topbar";
import { useSubscribedSettings } from "@/hooks/useSettings";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRedirectParam } from "@/hooks/useRedirectParam";
import { useRedirectAfterLogin } from "@/hooks/useRedirectAfterLogin";
import { loginWithCredential } from "@/utils/auth";
import { useLoadingCallback } from "react-loading-hook";
import { loginAction } from "@/actions/loginAction";
import { appendRedirectParam } from "@/utils/redirect";

const formSchema = z.object({
  password: z.string(),
  email: z.string().email({ message: "email 格式錯誤" }),
});

export default function Login() {
  const [hasLogged, setHasLogged] = useState(false);
  const [shouldLoginWithAction, setShouldLoginWithAction] = useState(false);
  let [isLoginActionPending, startTransition] = React.useTransition();
  const redirect = useRedirectParam();
  const redirectAfterLogin = useRedirectAfterLogin();
  const setting = useSubscribedSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  async function handleLogin(credential: UserCredential) {
    await loginWithCredential(credential);
    redirectAfterLogin();
  }

  const [handleLoginWithEmailAndPassword, isEmailLoading, emailPasswordError] =
    useLoadingCallback(
      async ({ email, password }: z.infer<typeof formSchema>) => {
        setHasLogged(false);

        if (shouldLoginWithAction) {
          startTransition(() => loginAction(email, password));
        } else {
          await handleLogin(
            await signInWithEmailAndPassword(auth, email, password)
          );

          setHasLogged(true);
        }
      }
    );

  useEffect(() => {
    async function handleLoginWithRedirect() {
      const credential = await getRedirectResult(auth);
      if (credential?.user) {
        await handleLogin(credential);
        setHasLogged(true);
      }
    }
    handleLoginWithRedirect();
  }, [handleLogin]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      handleLoginWithEmailAndPassword(values);
    } catch (e) {
      showErrorToast((e as Error).message);
    }
  }

  return (
    <>
      <TopBar />
      <main className="grid grid-cols-4 grid-rows-4">
        <section className="col-start-2 col-span-2 row-start-2 row-span-2 p-2 flex flex-col space-y-5 border-4  dark:border-none  ">
          <h3 className="text-xl font-medium text-white">登入 Hint Code</h3>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密碼</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        {...field}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                {isEmailLoading || isLoginActionPending ? "登入中..." : "登入"}
              </Button>
            </form>
          </Form>

          <section className="flex  justify-between">
            {setting?.showCreateAccountButton && (
              <div className="text-sm font-medium text-gray-300 ">
                還未註冊?
                <Link
                  className="text-brand-orange hover:underline"
                  href={appendRedirectParam("/register", redirect)}
                >
                  創造帳戶
                </Link>
              </div>
            )}
            {setting?.showForgetPasswordButton && (
              <Link
                className="text-sm text-brand-orange hover:underline text-right"
                href={appendRedirectParam("/forget-password", redirect)}
              >
                忘記密碼?
              </Link>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
