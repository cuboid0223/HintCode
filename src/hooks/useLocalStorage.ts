import { auth } from "@/firebase/firebase";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const useLocalStorage = (key: string, initialValue: any) => {
  const [user] = useAuthState(auth);
  const [value, setValue] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } else {
        console.log("初始");
        return initialValue;
      }
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (!user?.uid) return;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, value, user?.uid]);

  return [value, setValue];
};

export default useLocalStorage;
