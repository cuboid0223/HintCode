import { useLocalStorage } from "@uidotdev/usehooks";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";

type TimerProps = {};

const Timer: React.FC<TimerProps> = () => {
  const [user] = useAuthState(auth);
  const params = useParams<{ pid: string }>();
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useLocalStorage(
    `elapsed-time-${params.pid}-${user?.uid}`,
    0
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const needsUpdateRef = useRef<boolean>(false);

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
            console.log("acceptedTime updated");
            lastUpdateRef.current = Date.now();
            needsUpdateRef.current = false;
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
      setElapsedTime((prevTime) => {
        const newTime = prevTime + 1;
        if (Date.now() - lastUpdateRef.current >= 60000) {
          needsUpdateRef.current = true;
        }
        return newTime;
      });
    }, 1000);
  }, [setElapsedTime]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const initializeTimer = async () => {
      if (!user) return;

      try {
        const docSnap = await getDoc(userProblemRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.is_solved) {
            setElapsedTime(data.acceptedTime);
            stopTimer();
          } else {
            const storedTime = localStorage.getItem(
              `elapsed-time-${params.pid}-${user.uid}`
            );
            if (storedTime) {
              setElapsedTime(Number(storedTime));
            } else if (data.acceptedTime) {
              setElapsedTime(data.acceptedTime);
            }
            startTimer();
          }
        } else {
          setElapsedTime(0);
          startTimer();
        }
      } catch (error) {
        console.error("Error initializing timer:", error);
      }
    };

    initializeTimer();

    return () => {
      stopTimer();
      if (needsUpdateRef.current) {
        updateAcceptedTime(elapsedTime);
      }
    };
  }, [
    user,
    params.pid,
    startTimer,
    stopTimer,
    setElapsedTime,
    updateAcceptedTime,
    elapsedTime,
    userProblemRef,
  ]);

  useEffect(() => {
    if (needsUpdateRef.current) {
      updateAcceptedTime(elapsedTime);
    }
  }, [elapsedTime, updateAcceptedTime]);

  return (
    <div>
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
    </div>
  );
};

export default Timer;
