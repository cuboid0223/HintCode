import { authModalState } from "@/atoms/authModalAtom";
import { auth, firestore } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";

type SignupProps = {};
const avatar = createAvatar(thumbs, {
  // ... options
  seed: "Felix",
  flip: true,
  size: 32,
  backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
  backgroundType: ["gradientLinear", "solid"],
  randomizeIds: true,
  eyesColor: ["000000", "ffffff"],
  shapeColor: ["0a5b83", "1c799f", "69d2e7", "f1f4dc"],
  radius: 50,
});
const svg = avatar.toString();

const Signup: React.FC<SignupProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const handleClick = () => {
    setAuthModalState((prev) => ({ ...prev, type: "login" }));
  };
  const [inputs, setInputs] = useState({
    email: "",
    displayName: "",
    password: "",
  });
  const router = useRouter();
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputs.email || !inputs.password || !inputs.displayName)
      return alert("請填寫 Email 或是 密碼");
    try {
      toast.loading("正在創建帳號", {
        position: "top-center",
        toastId: "loadingToast",
      });
      const newUser = await createUserWithEmailAndPassword(
        inputs.email,
        inputs.password
      );
      if (!newUser) return;
      const userRef = doc(firestore, "users", newUser.user.uid);
      const problemId = uuidv4();

      const userData = {
        uid: newUser.user.uid,
        email: newUser.user.email,
        displayName: inputs.displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        likedProblems: [],
        dislikedProblems: [],
        solvedProblems: [],
        starredProblems: [],
        totalScore: 0,
        thumbnail: svg,
      };
      await setDoc(userRef, userData);

      // 空的 historyData
      const problemsData = {
        name: "greet-n-times",
        threadId: "",
      };
      const problemsCollectionRef = collection(userRef, "problems");
      const problemDocRef = doc(problemsCollectionRef, problemId);
      await setDoc(problemDocRef, problemsData);

      // // 空的 messageData
      // const messageData = {
      //   content: "",
      //   role: "",
      //   createdAt: Date.now(),
      // };
      // const messagesCollectionRef = collection(historyDocRef, "messages");
      // const messagesDocRef = doc(messagesCollectionRef, messageId);
      // await setDoc(messagesDocRef, messageData);

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

  return (
    <form className="space-y-6 px-6 pb-4" onSubmit={handleRegister}>
      <h3 className="text-xl font-medium text-white">Register to LeetClone</h3>
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Email
        </label>
        <input
          onChange={handleChangeInput}
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
          htmlFor="displayName"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Display Name
        </label>
        <input
          onChange={handleChangeInput}
          type="displayName"
          name="displayName"
          id="displayName"
          className="
        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
        bg-gray-600 border-gray-500 placeholder-gray-400 text-white
    "
          placeholder="John Doe"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Password
        </label>
        <input
          onChange={handleChangeInput}
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
            text-sm px-5 py-2.5 text-center bg-brand-orange hover:bg-brand-orange-s
        "
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <div className="text-sm font-medium text-gray-300">
        Already have an account?{" "}
        <a
          href="#"
          className="text-blue-700 hover:underline"
          onClick={handleClick}
        >
          Log In
        </a>
      </div>
    </form>
  );
};
export default Signup;
