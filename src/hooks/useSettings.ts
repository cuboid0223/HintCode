import { firestore } from "@/firebase/firebase";
import { DevSettings } from "@/types/global";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";

const fetchSubscribedSettings = async (
  setSettings: React.Dispatch<DevSettings>
) => {
  try {
    const q = query(collection(firestore, "settings"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tmp: DevSettings = null;
      querySnapshot.forEach((doc) => {
        setSettings(doc.data() as DevSettings);
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// 隨時監聽 user problems 變化
const useSubscribedSettings = () => {
  const [settings, setSettings] = useState<DevSettings>(null);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchAndSubscribe = async () => {
      unsubscribe = await fetchSubscribedSettings(setSettings);
    };

    fetchAndSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return settings;
};

// export default useSettings;
export { useSubscribedSettings };
