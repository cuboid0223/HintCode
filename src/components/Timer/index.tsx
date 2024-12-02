import { useLocalStorage } from "@uidotdev/usehooks";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import getUserProblemById from "@/utils/problems/getUserProblemById";
import { UserProblem } from "@/types/problem";

type TimerProps = {};

const Timer: React.FC<TimerProps> = () => {
  const [user] = useAuthState(auth);
  const params = useParams<{ pid: string }>();
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [userProblem, setUserProblem] = useState<UserProblem | null>(null);
  const [elapsedTime, setElapsedTime] = useLocalStorage(
    `elapsed-time-${params.pid}-${user?.uid}`,
    0
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const elapsedTimeRef = useRef(elapsedTime);

  const userProblemRef = doc(
    firestore,
    "users",
    user?.uid,
    "problems",
    params.pid
  );

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const updateAcceptedTime = useCallback(
    (time: number) => {
      if (user) {
        updateDoc(userProblemRef, { acceptedTime: time })
          .then(() => {
            lastUpdateRef.current = Date.now();
          })
          .catch((error) =>
            console.error("Error updating acceptedTime:", error)
          );
      }
    },
    [user, userProblemRef]
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      elapsedTimeRef.current += 1;
      setElapsedTime(elapsedTimeRef.current);

      if (Date.now() - lastUpdateRef.current >= 60000) {
        updateAcceptedTime(elapsedTimeRef.current);
      }
    }, 1000);
  }, [setElapsedTime, updateAcceptedTime]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const initializeTimer = async () => {
      if (!user || !userProblem) return;
      const { is_solved, acceptedTime } = userProblem;
      try {
        if (is_solved) {
          setElapsedTime(acceptedTime);
          elapsedTimeRef.current = acceptedTime;
          stopTimer();
          return;
        }
        setElapsedTime(elapsedTime);
        elapsedTimeRef.current = elapsedTime;
        startTimer();
      } catch (error) {
        console.error("Error initializing timer:", error);
      }
    };

    initializeTimer();

    return () => stopTimer();
  }, [
    user,
    params.pid,
    startTimer,
    stopTimer,
    elapsedTime,
    userProblem,
    setElapsedTime,
    updateAcceptedTime,
    userProblemRef,
  ]);

  useEffect(() => {
    const handleUserProblem = async () => {
      if (!user.uid) return;
      setUserProblem(await getUserProblemById(user.uid, params.pid));
    };
    handleUserProblem();
  }, [user.uid, params.pid]);

  return (
    <section className="hidden md:block">
      {showTimer ? (
        <div className="flex items-center space-x-2 bg-dark-fill-3 p-1.5 cursor-pointer rounded hover:bg-dark-fill-2">
          <div>{formatTime(elapsedTime)}</div>
        </div>
      ) : (
        <div
          className="flex items-center p-1 h-8 hover:bg-dark-fill-3 rounded cursor-pointer"
          onClick={() => setShowTimer(true)}
        >
          {/* Timer icon SVG */}
        </div>
      )}
    </section>
  );
};

export default Timer;
