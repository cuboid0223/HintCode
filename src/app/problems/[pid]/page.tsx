// Import your Client Component
import { firestore } from "@/firebase/firebase";
import ProblemPage from "./problem-page";
import { problems } from "@/utils/problems";
import { doc, getDoc } from "firebase/firestore";

export default async function Page({ params }) {
  const problem = await getProblem(params);

  const { pid } = params;

  const docRef = doc(firestore, "problems", pid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return <div>Problem not found!</div>;
  }

  const problemData = docSnap.data();
  console.log("first, ", problemData);
  // Forward fetched data to your Client Component
  return <ProblemPage problem={problemData} />;
}

export async function generateStaticParams() {
  const paths = Object.keys(problems).map((key) => ({ pid: key }));
  // console.log("p: ", paths);
  return paths;
}

async function getProblem(params: { pid: string }) {
  const problem = problems[params.pid];
  // console.log(params);

  if (!problem) {
    return {
      notFound: true,
    };
  }
  // problem.handlerFunction = problem.handlerFunction.toString();

  return problem;
}
