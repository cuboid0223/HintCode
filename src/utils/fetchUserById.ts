import { firestore } from "@/firebase/firebase";
import { User } from "@/types/global";
import { doc, getDoc } from "firebase/firestore";

const fetchUserById = async (userId: string): Promise<User | null> => {
try {
    const userRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
    //   console.log("User info:", docSnap.data());
    return docSnap.data() as User;
    } else {
    //   console.log("No User info!");
    return null;
    }
} catch (error) {
    console.error("Error fetching user data:", error);
    return null;
}
};

export default fetchUserById;
