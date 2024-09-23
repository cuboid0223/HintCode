import { doc, getDoc } from "firebase/firestore";
import { DevSettings } from "@/types/global";
import { firestore } from "@/firebase/firebase";

const getMaintenanceSettings = async () => {
  const settingsRef = doc(firestore, "settings", "data");
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    const settings = settingsSnap.data() as DevSettings;
    return settings.isMaintained;
  }
};

export { getMaintenanceSettings };
