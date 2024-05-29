// Import your Client Component
import { firestore } from "@/firebase/firebase";
import ProblemPage from "./problem-page";
import { doc, getDoc } from "firebase/firestore";

export default async function Page({ params }) {
  const { pid } = params;
  const docRef = doc(firestore, "problems", pid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return <div>Problem not found!</div>;
  }

  const problemData = docSnap.data();
  // console.log("problemData: ", problemData);
  // Forward fetched data to your Client Component
  return <ProblemPage problem={problemData} />;
}

// export async function generateStaticParams() {
//   const paths = Object.keys(problems).map((key) => ({ pid: key }));
//   // console.log("p: ", paths);
//   return paths;
// }
