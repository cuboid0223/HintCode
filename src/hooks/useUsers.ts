import { firestore } from "@/firebase/firebase";
import { User } from "../types/global";
import {
  collection,
  orderBy,
  query,
  getDocs,
  onSnapshot,
  where,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTransition } from "react-spring";
import useGetUserInfo from "./useGetUserInfo";
const DEFAULT_HEIGHT_FOR_ANIMATION = 64;

const fetchSubscribedUsers = async (setUsers: React.Dispatch<User[]>) => {
  try {
    const q = query(
      collection(firestore, "users"),
      orderBy("totalScore", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersList: User[] = [];
      querySnapshot.forEach((doc) => {
        usersList.push(doc.data() as User);
      });

      console.log("users: ", usersList);
      setUsers(usersList);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// 隨時監聽 users 變化
const useGetSubscribedUsers = () => {
  const [subscribedUsers, setSubscribedUsers] = useState<User[]>([]);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchAndSubscribe = async () => {
      unsubscribe = await fetchSubscribedUsers(setSubscribedUsers);
    };

    fetchAndSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return subscribedUsers;
};

// handle row change animation
const usersWithHeight = (users: User[]) => {
  const updatedUsers = users.map((user) => ({
    ...user,
    height: DEFAULT_HEIGHT_FOR_ANIMATION,
  }));

  return updatedUsers;
};
const useUserTransitions = (
  usersData: User[],
  startIndex: number = 0,
  endIndex: number = usersData.length
) => {
  let heightAccumulator = 0;
  return useTransition(
    usersWithHeight(usersData)
      .slice(startIndex, endIndex)
      .map((data) => ({
        ...data,
        y: (heightAccumulator += data.height) - data.height,
      })),
    {
      keys: (user) => user.uid,
      from: { height: 0, opacity: 0 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      leave: { height: 0, opacity: 0 },
      update: ({ y, height }) => ({ y, height }),
    }
  );
};

function useGetUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const userData = useGetUserInfo();
  useEffect(() => {
    const getUsers = async () => {
      if (!userData) return;
      const unitRef = doc(firestore, "units", userData.unit.id);
      console.log(unitRef);
      const q = query(
        collection(firestore, "users"),
        where("unit", "==", unitRef),
        orderBy("totalScore", "desc")
      );
      const querySnapshot = await getDocs(q);
      const tmp: User[] = [];
      querySnapshot.forEach((doc) => {
        tmp.push(doc.data() as User);
      });
      setUsers(tmp);
    };

    getUsers();
  }, [userData]);

  return users;
}

export default useGetUsers;
export { useGetSubscribedUsers, useUserTransitions };
