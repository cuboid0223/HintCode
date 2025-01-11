"use client";
import { auth, firestore } from "@/firebase/firebase";
import React, { useEffect, useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import { AuthDialog } from "@/types/global";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showErrorToast, showLoadingToast } from "@/utils/Toast/message";
import TopBar from "@/components/Topbar";
import Link from "next/link";
import useGetUnits from "@/hooks/useGetUnits";

const formSchema = z.object({
  password: z.string(),
  email: z.string().email({ message: "email 格式錯誤" }),
  displayName: z
    .string({
      required_error: "請輸入暱稱",
      invalid_type_error: "暱稱必須是字串",
    })
    .trim()
    .min(2, {
      message: "暱稱必須多於兩個字",
    })
    .max(10, { message: "暱稱必須少於10個字" }),
  unit: z
    .string({
      required_error: "請選擇學校單位",
    })
    .min(1, { message: "請選擇學校單位" }),
});

type SignupProps = {
  setAuthDialog?: React.Dispatch<React.SetStateAction<AuthDialog>>;
};

const Signup: React.FC<SignupProps> = ({ setAuthDialog }) => {
  const [name, setName] = useState("");
  const units = useGetUnits();
  const [thumbnail, setThumbnail] = useState("");
  const handleChangeDialogs = () => {
    setAuthDialog((prev) => ({ ...prev, type: "login" }));
  };
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      email: "",
      displayName: "",
      unit: "",
    },
  });
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const createThumbnail = (seed: string, size: 32 | 64) => {
    const avatar = createAvatar(thumbs, {
      // 隨機頭像設定
      seed: seed,
      flip: true,
      size: size,
      backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
      backgroundType: ["gradientLinear", "solid"],
      randomizeIds: true,
      eyesColor: ["000000", "ffffff"],
      shapeColor: ["0a5b83", "1c799f", "69d2e7", "f1f4dc"],
      radius: 50,
    });

    return avatar.toString();
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      showLoadingToast("正在創建帳號");
      const newUser = await createUserWithEmailAndPassword(
        values.email,
        values.password
      );
      if (!newUser) return;
      const userRef = doc(firestore, "users", newUser.user.uid);
      const unitRef = doc(firestore, "units", values.unit);

      const userData = {
        uid: newUser.user.uid,
        email: newUser.user.email,
        displayName: values.displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        completionRate: 0,
        thumbnail: createThumbnail(name, 32),
        thumbnail_64px: createThumbnail(name, 64),
        unit: unitRef,
        role: "user",
      };
      await setDoc(userRef, userData);

      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        showErrorToast("An unexpected error occurred");
      }
    } finally {
      toast.dismiss("loadingToast");
    }
  };

  useEffect(() => {
    if (error) alert(error.message);
  }, [error]);

  useEffect(() => {
    const svg_64px = createThumbnail(name, 64);
    setThumbnail(svg_64px);
  }, [name]);

  return (
    <main className="h-screen overflow-hidden">
      <TopBar isLoginBtnHidden={true} />
      <section className="grid grid-flow-col grid-cols-5 grid-rows-12  md:grid-cols-4  md:grid-rows-12 h-full ">
        <div className="col-start-2  col-span-3 row-start-2 row-end-12 md:col-start-2 md:col-end-4 md:row-start-2 md:row-end-12 p-2 flex flex-col space-y-5  dark:border-none overflow-hidden">
          <h2 className="md:text-2xl font-medium dark:text-white mb-3">
            創造屬於你的 HintCode 角色 !
          </h2>
          <div
            className="rounded-full mb-3"
            dangerouslySetInnerHTML={{
              __html: thumbnail,
            }}
          ></div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-1 md:space-y-4 w-full"
            >
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>單位</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="">
                          <SelectValue placeholder="學校" />
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
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>暱稱</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="王大明"
                        onChange={(e) => {
                          field.onChange(e);
                          setName(e.target.value);
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      我們會根據您的暱稱產生最適合你的頭像
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                {loading ? "創造中..." : "創造"}
              </Button>
            </form>
          </Form>

          <div className="text-sm font-medium dark:text-gray-300">
            已經有帳號了嗎?{" "}
            <Link href="/login" className="text-blue-700 hover:underline">
              登入
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
export default Signup;
