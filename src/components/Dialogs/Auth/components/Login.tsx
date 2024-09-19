import { auth, firestore } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { AuthDialog } from "@/types/global";
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
import { showErrorToast } from "@/utils/Toast/message";
import { FORGET_PASSWORD, REGISTER } from "@/utils/const";
import { setCookie } from "cookies-next";
import jwt from "jsonwebtoken";
import { doc, getDoc } from "firebase/firestore";

const formSchema = z.object({
  password: z.string(),
  email: z.string().email({ message: "email 格式錯誤" }),
});

type LoginProps = {
  setAuthDialog?: React.Dispatch<React.SetStateAction<AuthDialog>>;
};

const Login: React.FC<LoginProps> = ({ setAuthDialog }) => {
  const handleChangeDialog = (
    type: "login" | "register" | "forgotPassword"
  ) => {
    setAuthDialog((prev) => ({ ...prev, type }));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const createToken = async (userId: string, role: string) => {
    const response = await fetch("/api/createToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role }),
    });

    const data = await response.json();
    return data.token;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.email || !values.password)
      return alert("請填寫 Email 或是 密碼");
    try {
      const newUser = await signInWithEmailAndPassword(
        values.email,
        values.password
      );
      if (!newUser) return;
      const userRef = doc(firestore, "users", newUser.user.uid);
      const userSnap = await getDoc(userRef);

      const token = await createToken(newUser.user.uid, userSnap.data().role);
      setCookie("token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: true,
      });

      router.push("/");
    } catch (error: any) {
      console.log(error.message);
      showErrorToast(error.message);
    }
  };

  useEffect(() => {
    if (error) showErrorToast(error.message);
  }, [error]);
  return (
    <section className="p-2 flex flex-col space-y-5 border-4 mt-28 dark:border-none">
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
                  <Input placeholder="********" {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            {loading ? "登入中..." : "登入"}
          </Button>
        </form>
      </Form>

      <section className="flex  justify-between">
        <div className="text-sm font-medium text-gray-300 ">
          還未註冊?
          <a
            href="#"
            className="text-brand-orange hover:underline"
            onClick={() => handleChangeDialog(REGISTER)}
          >
            創造帳戶
          </a>
        </div>

        <a
          href="#"
          onClick={() => handleChangeDialog(FORGET_PASSWORD)}
          className=" text-sm  text-brand-orange hover:underline text-right"
        >
          忘記密碼?
        </a>
      </section>
    </section>
  );
};
export default Login;
