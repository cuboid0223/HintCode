import { firestore } from "@/firebase/firebase";
import { User } from "@/utils/types/global";
import {
  collection,
  orderBy,
  query,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
const HEIGHT_FOR_ANIMATION = 64;
/*

    const usersRef = collection(firestore, "users");
    const q = query(usersRef, orderBy("totalScore", "desc"), limit(10));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ ...doc.data(), height: 64 });
      });

      // 如果獲取到的用戶數少於 10，使用 mock data 補足
      if (usersList.length < 10) {
        const additionalUsers = mockUsersData.slice(0, 10 - usersList.length);
        setTop10UsersData([...usersList, ...additionalUsers]);
        // setTop10UsersData([...additionalUsers]);
      } else {
        setTop10UsersData(usersList);
      }
    });
*/

const usersWithHeight = (users: User[]) => {
  const updatedUsers = users.map((user) => ({
    ...user,
    height: HEIGHT_FOR_ANIMATION,
  }));

  return updatedUsers;
};

const userWithHeight = (user: User) => {
  return { ...user, height: HEIGHT_FOR_ANIMATION };
};

const fetchAndSubscribeToUsers = async (setUsers: React.Dispatch<User[]>) => {
  try {
    const q = query(
      collection(firestore, "users"),
      orderBy("totalScore", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersList: User[] = [];
      querySnapshot.forEach((doc) => {
        usersList.push(userWithHeight(doc.data() as User));
      });

      console.log("users: ", usersList);
      setUsers(usersList);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const useGetSubscribedUsers = () => {
  const [subscribedUsers, setSubscribedUsers] = useState<User[]>([]);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchAndSubscribe = async () => {
      unsubscribe = await fetchAndSubscribeToUsers(setSubscribedUsers);
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

function useGetUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const q = query(
        collection(firestore, "users"),
        orderBy("totalScore", "asc")
      );
      const querySnapshot = await getDocs(q);
      const tmp: User[] = [];
      querySnapshot.forEach((doc) => {
        tmp.push(doc.data() as User);
      });
      // console.log("problems from Firestore", tmp);
      setUsers(tmp);
    };

    getUsers();
  }, []);
  return users;
}

export { useGetUsers, useGetSubscribedUsers, usersWithHeight };
