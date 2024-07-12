import { firestore } from "@/firebase/firebase";
import { Message } from "../types/message";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

function useGetProblemMessages(
  userId: string,
  problemId: string,
  setLoadingProblemMessages: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [problemMessage, setProblemMessage] = useState<Message[]>([]);

  useEffect(() => {
    if (!userId || !problemId) return;
    const getProblemMessages = async () => {
      // fetching data logic
      setLoadingProblemMessages(true);
      const q = query(
        collection(
          firestore,
          "users",
          userId,
          "problems",
          problemId,
          "messages"
        ),
        orderBy("created_at", "asc")
      );
      const querySnapshot = await getDocs(q);
      const tmp: Message[] = [];
      querySnapshot.forEach((doc) => {
        tmp.push(doc.data() as Message);
      });
      console.log(`${problemId} messages from user(${userId})`, tmp);
      setProblemMessage(tmp);
      setLoadingProblemMessages(false);
    };

    getProblemMessages();
  }, [setLoadingProblemMessages, userId, problemId]);
  return problemMessage;
}

export default useGetProblemMessages;
