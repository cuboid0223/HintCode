import { auth, firestore } from "@/firebase/firebase";
import { User } from "../../types/global";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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
