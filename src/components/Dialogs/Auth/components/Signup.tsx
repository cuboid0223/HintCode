import { auth, firestore } from "@/firebase/firebase";
import { useEffect, useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { doc, setDoc } from "firebase/firestore";
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
    .max(5, { message: "暱稱必須少於五個字" }),
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
    // console.log(`handleOnSubmit -> ${JSON.stringify(values)}`);
    try {
      toast.loading("正在創建帳號", {
        position: "top-center",
        toastId: "loadingToast",
      });
      const newUser = await createUserWithEmailAndPassword(
        values.email,
        values.password
      );
      if (!newUser) return;
      const userRef = doc(firestore, "users", newUser.user.uid);

      const userData = {
        uid: newUser.user.uid,
        email: newUser.user.email,
        displayName: values.displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalScore: 0,
        thumbnail: createThumbnail(name, 32),
        thumbnail_64px: createThumbnail(name, 64),
        unit: values.unit,
      };
      await setDoc(userRef, userData);

      router.push("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message, { position: "top-center" });
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
    <section className="p-2 flex flex-col space-y-5 border-4 mt-28 dark:border-none">
      <h2 className="text-2xl font-medium dark:text-white mb-3">
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
          className="space-y-4 w-full"
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
                      <SelectItem value="中興大學">中興大學</SelectItem>
                      <SelectItem value="台中科技大學">台中科技大學</SelectItem>
                      <SelectItem value="台中教育大學">台中教育大學</SelectItem>
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
                  <Input placeholder="********" {...field} type="password" />
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
        <a
          href="#"
          className="text-blue-700 hover:underline"
          onClick={handleChangeDialogs}
        >
          登入
        </a>
      </div>
    </section>
  );
};
export default Signup;
