// Import your Client Component
import ProblemPage from "./problem-page";
import { problems } from "@/utils/problems";

export default async function Page({ params }) {
  const problem = await getProblem(params);

  // Forward fetched data to your Client Component
  return <ProblemPage problem={problem} />;
}

export async function generateStaticParams() {
  const paths = Object.keys(problems).map((key) => ({ pid: key }));
  console.log("p: ", paths);
  return paths;
}

async function getProblem(params: { pid: string }) {
  const problem = problems[params.pid];
  console.log(params);
  if (!problem) {
    return {
      notFound: true,
    };
  }
  problem.handlerFunction = problem.handlerFunction.toString();

  return problem;
}
