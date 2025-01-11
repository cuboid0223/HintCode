import { firestore } from "@/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

function useGetUnits() {
  const [units, setUnits] = useState([]);
  useEffect(() => {
    const getUnits = async () => {
      const unitsRef = collection(firestore, "units");
      let tmp = [];
      const unitSnapshot = await getDocs(unitsRef);
      unitSnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        tmp.push({ id: doc.id, ...doc.data() });
      });
      setUnits(tmp);
    };

    getUnits();
  }, []);

  return units;
}

export default useGetUnits;
