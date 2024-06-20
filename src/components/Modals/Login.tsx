import { authModalState } from "@/atoms/authModalAtom";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { toast } from "react-toastify";
import { AuthModal } from "@/utils/types/global";
type LoginProps = {
  setAuthModal?: React.Dispatch<React.SetStateAction<AuthModal>>;
};

const Login: React.FC<LoginProps> = ({ setAuthModal }) => {
  // const setAuthModalState = useSetRecoilState(authModalState);
  const handleClick = (type: "login" | "register" | "forgotPassword") => {
    setAuthModal((prev) => ({ ...prev, type }));
  };
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputs.email || !inputs.password)
      return alert("請填寫 Email 或是 密碼");
    try {
      const newUser = await signInWithEmailAndPassword(
        inputs.email,
        inputs.password
      );
      if (!newUser) return;

      router.push("/");
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  useEffect(() => {
    if (error)
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
  }, [error]);
  return (
    <section className="p-2 flex flex-col space-y-5 border-4 mt-28 dark:border-none">
      <form className="space-y-6 px-6 pb-4" onSubmit={handleLogin}>
        <h3 className="text-xl font-medium text-white">登入 Hint Code</h3>
        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium block mb-2 text-gray-300"
          >
            Email
          </label>
          <input
            onChange={handleInputChange}
            type="email"
            name="email"
            id="email"
            className="
            border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white
        "
            placeholder="name@company.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium block mb-2 text-gray-300"
          >
            密碼
          </label>
          <input
            onChange={handleInputChange}
            type="password"
            name="password"
            id="password"
            className="
            border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
            bg-gray-600 border-gray-500 placeholder-gray-400 text-white
        "
            placeholder="*******"
          />
        </div>

        <button
          type="submit"
          className="w-full text-white focus:ring-blue-300 font-medium rounded-lg
                text-sm px-5 py-2.5 text-center 
            "
        >
          {loading ? "載入中..." : "登入"}
        </button>
        <button
          className="flex w-full justify-end"
          onClick={() => handleClick("forgotPassword")}
        >
          <a
            href="#"
            className="text-sm block text-brand-orange hover:underline w-full text-right"
          >
            忘記密碼?
          </a>
        </button>
        <div className="text-sm font-medium text-gray-300">
          還未註冊?{" "}
          <a
            href="#"
            className="text-blue-700 hover:underline"
            onClick={() => handleClick("register")}
          >
            創造帳戶
          </a>
        </div>
      </form>
    </section>
  );
};
export default Login;
