import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRecoilValue } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";
import { Badge } from "@/components/ui/badge";
import { EASY, HARD, MEDIUM } from "@/utils/const";

const DescriptionTab = () => {
  const problem = useRecoilValue(problemDataState);
  const { resolvedTheme } = useTheme();

  const handleBadgeColor = (difficulty: string) => {
    switch (difficulty.toLowerCase().trim()) {
      case EASY:
        return "bg-green-500";
      case MEDIUM:
        return "bg-yellow-500";
      case HARD:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  return (
    <div className="flex px-5 py-4  overflow-y-auto">
      <div className="flex-1">
        {/* Problem heading */}
        <div className="w-full">
          <h1 className="mr-2 text-lg  font-medium">{problem?.title}</h1>
          <Badge className={`my-2 ${handleBadgeColor(problem?.difficulty)}`}>
            {problem?.difficulty}
          </Badge>
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // markdown components integrated with shadcn UI
              h3({ className, ...rest }) {
                return (
                  <h3
                    className="scroll-m-20 text-2xl font-semibold tracking-tight"
                    {...rest}
                  ></h3>
                );
              },
              ul({ className, ...rest }) {
                return (
                  <ul
                    className="my-6 ml-6 list-disc [&>li]:mt-2"
                    {...rest}
                  ></ul>
                );
              },
              table({ className, ...rest }) {
                return <table className="w-full mb-6" {...rest}></table>;
              },
              tr({ className, ...rest }) {
                return (
                  <tr className="m-0 border-t p-0 even:bg-muted" {...rest}></tr>
                );
              },
              th({ className, ...rest }) {
                return (
                  <th
                    className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></th>
                );
              },
              td({ className, ...rest }) {
                return (
                  <td
                    className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></td>
                );
              },
              blockquote({ className, ...rest }) {
                return (
                  <blockquote
                    className="mb-3 border-l-4 p-3 pl-6  bg-gray-300 dark:bg-gray-400 rounded-md border-gray-400 dark:border-gray-300  text-gray-600"
                    {...rest}
                  ></blockquote>
                );
              },
              hr({ className, ...rest }) {
                return (
                  <hr
                    className="my-3 border-gray-400 dark:border-gray-300 border-1 "
                    {...rest}
                  ></hr>
                );
              },
              code({ children, className, node, ...rest }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  //  SyntaxHighlighter 沒有提供 Type
                  <SyntaxHighlighter
                    {...rest}
                    language="python"
                    style={resolvedTheme === "dark" ? a11yDark : docco}
                    showLineNumbers
                    wrapLongLines
                  >
                    {children}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    {...rest}
                    className="text-white dark:text-black bg-gray-400 px-1  "
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {problem.problemStatement}
          </Markdown>
        </div>
      </div>
    </div>
  );
};
export default DescriptionTab;
