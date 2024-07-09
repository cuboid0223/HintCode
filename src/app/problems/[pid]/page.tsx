import { firestore } from "@/firebase/firebase";
import ProblemPage from "./problemPage";
import { doc, getDoc } from "firebase/firestore";

export default async function Page({ params }) {
  const { pid } = params;
  const docRef = doc(firestore, "problems", pid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return <div>Problem not found!</div>;
  }

  const problemData = docSnap.data();

  return <ProblemPage problem={problemData} />;
}
