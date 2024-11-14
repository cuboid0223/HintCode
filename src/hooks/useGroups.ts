import { firestore } from "@/firebase/firebase";
import { CONTROL, EXPERIMENTAL } from "@/utils/const";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

function useGroups() {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    const getGroups = async () => {
      const groupsRef = collection(firestore, "groups");
      let control = null;
      let experimental = null;
      const groupSnapshot = await getDocs(groupsRef);
      groupSnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        control = doc.id === CONTROL && doc.data();
        experimental = doc.id === EXPERIMENTAL && doc.data();
      });
      setGroups([control, experimental]);
    };

    getGroups();
  }, []);

  return groups;
}

export default useGroups;
