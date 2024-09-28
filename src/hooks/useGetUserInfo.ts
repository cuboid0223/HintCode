import { auth, firestore } from "@/firebase/firebase";
import { User } from "../types/global";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import fetchUserById from "@/utils/fetchUserById";



const useGetUserInfo = () => {
  const [user] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  // 避免在每次渲染時重新創建函數
  const getUserInfo = useCallback(async () => {
    if (user) {
      const data = await fetchUserById(user.uid);
      setUserInfo(data);
    }
  }, [user]);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  return userInfo;
};
const fetchSubscribedUser = async (
  userId: string,
  setUser: React.Dispatch<User>
) => {
  try {
    const userRef = doc(firestore, "users", userId);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      setUser(doc.data() as User);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// 動態監聽 user 變化
const useGetSubscribedUser = () => {
  const [user] = useAuthState(auth);
  const [subscribedUser, setSubscribedUser] = useState<User | null>(null);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchAndSubscribe = async () => {
      unsubscribe = await fetchSubscribedUser(user.uid, setSubscribedUser);
    };

    fetchAndSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user.uid]);

  return subscribedUser;
};

export default useGetUserInfo;
export { useGetSubscribedUser };
