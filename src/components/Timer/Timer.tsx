import useLocalStorage from "@/hooks/useLocalStorage";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { useRecoilState } from "recoil";
import {
  submissionsDataState,
  SubmissionsDataState,
} from "@/atoms/submissionsDataAtom";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
type TimerProps = {};

const Timer: React.FC<TimerProps> = () => {
  //   let intervalId: NodeJS.Timeout;
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const [user] = useAuthState(auth);
  const [submissionsData, setSubmissionsData] =
    useRecoilState<SubmissionsDataState>(submissionsDataState);
  const params = useParams<{ pid: string }>();
  const [elapsedTime, setElapsedTime] = useState(
    () => Number(localStorage.getItem(`elapsed-time-${params.pid}`)) || 0
  ); // 單位是秒

  const [showTimer, setShowTimer] = useState<boolean>(true);

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const stopTimer = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  };

  useEffect(() => {
    if (showTimer) {
      intervalIdRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => stopTimer();
  }, [showTimer]);

  useEffect(() => {
    const handleAcceptedTime = (submissionsData: SubmissionsDataState) => {
      if (!user) return;
      const isAllTestCasesAccepted = submissionsData.submissions.every(
        // 全部測資都通過 isAllTestCasesAccepted 才會是 true
        (submission) => submission?.status.id === 3
      );
      // 更新 elapsedTime 到 localStorage
      if (submissionsData.problemId === params.pid && isAllTestCasesAccepted) {
        // acceptedTime: number
        // elapsedTime: number
        const userProblemRef = doc(
          firestore,
          "users",
          user.uid,
          "problems",
          params.pid
        );
        stopTimer();
        return updateDoc(userProblemRef, {
          acceptedTime: Number(
            localStorage.getItem(`elapsed-time-${params.pid}`)
          ),
        });
      }
    };

    handleAcceptedTime(submissionsData);
    localStorage.setItem(`elapsed-time-${params.pid}`, String(elapsedTime));
  }, [elapsedTime, submissionsData, params.pid]);

  return (
    <div>
      {showTimer ? (
        <div className="flex items-center space-x-2 bg-dark-fill-3 p-1.5 cursor-pointer rounded hover:bg-dark-fill-2">
          <div>{formatTime(elapsedTime)}</div>
          {/* <FiRefreshCcw
            onClick={() => {
              setShowTimer(false);
              setTime(0);
            }}
          /> */}
        </div>
      ) : (
        <div
          className="flex items-center p-1 h-8 hover:bg-dark-fill-3 rounded cursor-pointer"
          onClick={() => setShowTimer(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M12 4a9 9 0 110 18 9 9 0 010-18zm0 2a7 7 0 100 14 7 7 0 000-14zm0 1.634a1 1 0 01.993.883l.007.117-.001 3.774 2.111 1.162a1 1 0 01.445 1.253l-.05.105a1 1 0 01-1.254.445l-.105-.05-2.628-1.447a1 1 0 01-.51-.756L11 13V8.634a1 1 0 011-1zM16.235 2.4a1 1 0 011.296-.269l.105.07 4 3 .095.08a1 1 0 01-1.19 1.588l-.105-.069-4-3-.096-.081a1 1 0 01-.105-1.319zM7.8 2.4a1 1 0 01-.104 1.319L7.6 3.8l-4 3a1 1 0 01-1.296-1.518L2.4 5.2l4-3a1 1 0 011.4.2z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
};
export default Timer;
