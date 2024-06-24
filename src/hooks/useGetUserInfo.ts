import { auth, firestore } from "@/firebase/firebase";
import { User } from "@/utils/types/global";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const fetchUserInfo = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      //   console.log("User info:", docSnap.data());
      return docSnap.data() as User;
    } else {
      //   console.log("No User info!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

const useGetUserInfo = () => {
  const [user] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  // 避免在每次渲染時重新創建函數
  const getUserInfo = useCallback(async () => {
    if (user) {
      const data = await fetchUserInfo(user.uid);
      setUserInfo(data);
    }
  }, [user]);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  return userInfo;
};

export default useGetUserInfo;
