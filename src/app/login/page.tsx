"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
import { useRedirectParam } from "@/hooks/useRedirectParam";
import { useRedirectAfterLogin } from "@/hooks/useRedirectAfterLogin";
import { loginWithCredential } from "@/utils/auth";
import { useLoadingCallback } from "react-loading-hook";
import { appendRedirectParam } from "@/utils/auth/redirect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGetUnits from "@/hooks/useGetUnits";

/**
 * 定義表單驗證：
 * - 若 unit === "ntcu"，只驗證 studentId 必填 (email 不必填)。
 * - 若 unit !== "ntcu"，只驗證 email 必填 (studentId 不必填)。
 */
const formSchema = z
  .object({
    password: z.string(),
    unit: z
      .string({
        required_error: "請選擇學校單位",
      })
      .min(1, { message: "請選擇學校單位" }),

    // studentId 與 email 都先標為 optional，
    // 實際必填與否透過 superRefine 動態判斷
    studentId: z.string().optional(),
    email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email({ message: "email 格式錯誤" }).optional()),
  })
  .superRefine((data, ctx) => {
    if (data.unit === "ntcu") {
      // ntcu => studentId 必填，email 可忽略
      if (!data.studentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["studentId"],
          message: "請輸入學號",
        });
      }
    } else {
      // 非 ntcu => email 必填，studentId 可忽略
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "請輸入 Email",
        });
      }
    }
  });

export default function Login() {
  const [hasLogged, setHasLogged] = useState(false);
  const units = useGetUnits(); // 取得單位列表
  const redirect = useRedirectParam(); // 取得登入後欲導向的網址
  const redirectAfterLogin = useRedirectAfterLogin();
  const setting = useSubscribedSettings();

  // 建立 react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      unit: "",
      studentId: "",
      email: "",
    },
  });

  // 根據 selectedUnit 來動態顯示/隱藏欄位
  const selectedUnit = form.watch("unit");

  // 實際登入邏輯
  const handleLogin = useCallback(
    async (credential: UserCredential) => {
      await loginWithCredential(credential);
      redirectAfterLogin();
      console.log("轉址");
      setHasLogged(true);
    },
    [redirectAfterLogin]
  );

  // 包裝 signInWithEmailAndPassword 的 loading 狀態
  const [handleLoginWithEmailAndPassword, isEmailLoading, emailPasswordError] =
    useLoadingCallback(
      async ({ email, password }: { email: string; password: string }) => {
        setHasLogged(false);
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        await handleLogin(credential);
      }
    );

  // 檢查是否有第三方登入導回的 credential
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

  // 表單送出
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.unit === "ntcu") {
        // ntcu => 根據 studentId 自動組出 email (studentId + "@mail.ntcu.edu.tw")
        const email = values.studentId + "@mail.ntcu.edu.tw";
        await handleLoginWithEmailAndPassword({
          email,
          password: values.password,
        });
      } else {
        // 其他單位 => 直接用 email 登入
        const email = values.email ?? "";
        await handleLoginWithEmailAndPassword({
          email,
          password: values.password,
        });
      }
    } catch (e) {
      showErrorToast((e as Error).message);
    }
  }

  // 處理 Firebase 登入錯誤訊息
  useEffect(() => {
    if (emailPasswordError?.message.includes("auth/invalid-login-credentials"))
      showErrorToast("帳號或密碼錯誤");
    if (emailPasswordError?.message.includes("auth/too-many-requests"))
      showErrorToast("目前人流眾多請稍後 1 至 2 分鐘後再試一次");
  }, [emailPasswordError]);

  return (
    <main className="h-screen overflow-hidden">
      <TopBar />
      <section className="grid md:grid-cols-4 grid-rows-5 ">
        <div className="md:col-start-2 md:col-span-2 row-start-2 row-span-3 p-2 flex flex-col space-y-5">
          <h3 className="text-xl font-medium dark:text-white">
            登入 Hint Code
          </h3>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              {/* (1) 單位選擇 */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>單位</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇學校" />
                        </SelectTrigger>
                        <SelectContent>
                          {units?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* (2) 如果是 ntcu，顯示 studentId；否則顯示 email */}
              {selectedUnit === "ntcu" ? (
                // studentId 欄位
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>學號</FormLabel>
                      <FormControl>
                        <Input placeholder="請輸入學號" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                // email 欄位
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* (3) 密碼欄位 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密碼</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* (4) 送出按鈕 */}
              <Button
                className="w-full bg-slate-400 dark:bg-primary"
                type="submit"
                disabled={isEmailLoading && !hasLogged}
              >
                {isEmailLoading && !hasLogged ? "登入中..." : "登入"}
              </Button>
            </form>
          </Form>

          {/* 註冊 / 忘記密碼 */}
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
        </div>
      </section>
    </main>
  );
}
