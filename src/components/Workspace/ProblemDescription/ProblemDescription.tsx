import CircleSkeleton from "@/components/Skeletons/CircleSkeleton";
import RectangleSkeleton from "@/components/Skeletons/RectangleSkeleton";
import { auth, firestore } from "../../../firebase/firebase";
import { DBProblem, Problem } from "@/utils/types/problem";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  AiFillLike,
  AiFillDislike,
  AiOutlineLoading3Quarters,
  AiFillStar,
} from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline } from "react-icons/ti";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProblemHelp from "./ProblemHelp";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
type ProblemDescriptionProps = {
  problem: Problem;
  _solved: boolean;
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  problem,
  _solved,
}) => {
  const [user] = useAuthState(auth);
  const { resolvedTheme } = useTheme();
  const { currentProblem, loading, problemDifficultyClass, setCurrentProblem } =
    useGetCurrentProblem(problem.id);
  const { liked, disliked, solved, setData, starred } =
    useGetUsersDataOnProblem(problem.id);
  const [updating, setUpdating] = useState(false);

  const returnUserDataAndProblemData = async (transaction: any) => {
    const userRef = doc(firestore, "users", user!.uid);
    const problemRef = doc(firestore, "problems", problem.id);
    const userDoc = await transaction.get(userRef);
    const problemDoc = await transaction.get(problemRef);
    return { userDoc, problemDoc, userRef, problemRef };
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like a problem", {
        position: "top-left",
        theme: "dark",
      });
      return;
    }
    if (updating) return;
    setUpdating(true);
    await runTransaction(firestore, async (transaction) => {
      const { problemDoc, userDoc, problemRef, userRef } =
        await returnUserDataAndProblemData(transaction);

      if (userDoc.exists() && problemDoc.exists()) {
        if (liked) {
          // remove problem id from likedProblems on user document, decrement likes on problem document
          transaction.update(userRef, {
            likedProblems: userDoc
              .data()
              .likedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            likes: problemDoc.data().likes - 1,
          });

          setCurrentProblem((prev) =>
            prev ? { ...prev, likes: prev.likes - 1 } : null
          );
          setData((prev) => ({ ...prev, liked: false }));
        } else if (disliked) {
          transaction.update(userRef, {
            likedProblems: [...userDoc.data().likedProblems, problem.id],
            dislikedProblems: userDoc
              .data()
              .dislikedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            likes: problemDoc.data().likes + 1,
            dislikes: problemDoc.data().dislikes - 1,
          });

          setCurrentProblem((prev) =>
            prev
              ? { ...prev, likes: prev.likes + 1, dislikes: prev.dislikes - 1 }
              : null
          );
          setData((prev) => ({ ...prev, liked: true, disliked: false }));
        } else {
          transaction.update(userRef, {
            likedProblems: [...userDoc.data().likedProblems, problem.id],
          });
          transaction.update(problemRef, {
            likes: problemDoc.data().likes + 1,
          });
          setCurrentProblem((prev) =>
            prev ? { ...prev, likes: prev.likes + 1 } : null
          );
          setData((prev) => ({ ...prev, liked: true }));
        }
      }
    });
    setUpdating(false);
  };

  const handleDislike = async () => {
    if (!user) {
      toast.error("You must be logged in to dislike a problem", {
        position: "top-left",
        theme: "dark",
      });
      return;
    }
    if (updating) return;
    setUpdating(true);
    await runTransaction(firestore, async (transaction) => {
      const { problemDoc, userDoc, problemRef, userRef } =
        await returnUserDataAndProblemData(transaction);
      if (userDoc.exists() && problemDoc.exists()) {
        // already disliked, already liked, not disliked or liked
        if (disliked) {
          transaction.update(userRef, {
            dislikedProblems: userDoc
              .data()
              .dislikedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data().dislikes - 1,
          });
          setCurrentProblem((prev) =>
            prev ? { ...prev, dislikes: prev.dislikes - 1 } : null
          );
          setData((prev) => ({ ...prev, disliked: false }));
        } else if (liked) {
          transaction.update(userRef, {
            dislikedProblems: [...userDoc.data().dislikedProblems, problem.id],
            likedProblems: userDoc
              .data()
              .likedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data().dislikes + 1,
            likes: problemDoc.data().likes - 1,
          });
          setCurrentProblem((prev) =>
            prev
              ? { ...prev, dislikes: prev.dislikes + 1, likes: prev.likes - 1 }
              : null
          );
          setData((prev) => ({ ...prev, disliked: true, liked: false }));
        } else {
          transaction.update(userRef, {
            dislikedProblems: [...userDoc.data().dislikedProblems, problem.id],
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data().dislikes + 1,
          });
          setCurrentProblem((prev) =>
            prev ? { ...prev, dislikes: prev.dislikes + 1 } : null
          );
          setData((prev) => ({ ...prev, disliked: true }));
        }
      }
    });
    setUpdating(false);
  };

  const handleStar = async () => {
    if (!user) {
      toast.error("You must be logged in to star a problem", {
        position: "top-left",
        theme: "dark",
      });
      return;
    }
    if (updating) return;
    setUpdating(true);

    if (!starred) {
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        starredProblems: arrayUnion(problem.id),
      });
      setData((prev) => ({ ...prev, starred: true }));
    } else {
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        starredProblems: arrayRemove(problem.id),
      });
      setData((prev) => ({ ...prev, starred: false }));
    }

    setUpdating(false);
  };

  return (
    <div className="flex px-5 py-4  overflow-y-auto">
      <div>
        {/* Problem heading */}
        <div className="w-full">
          <div className="flex space-x-4">
            <div className="flex-1 mr-2 text-lg  font-medium">
              {problem?.title}
            </div>
          </div>
          {/* Difficulty / likes / dislikes / star */}
          {!loading && currentProblem && (
            <div className="flex items-center my-3">
              <div
                className={`${problemDifficultyClass} inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize `}
              >
                {currentProblem.difficulty}
              </div>
              {(solved || _solved) && (
                <div className="rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s">
                  <BsCheck2Circle />
                </div>
              )}
              <div
                className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-dark-gray-6"
                onClick={handleLike}
              >
                {liked && !updating && (
                  <AiFillLike className="text-dark-blue-s" />
                )}
                {!liked && !updating && <AiFillLike />}
                {updating && (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                )}

                <span className="text-xs">{currentProblem.likes}</span>
              </div>
              <div
                className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-green-s text-dark-gray-6"
                onClick={handleDislike}
              >
                {disliked && !updating && (
                  <AiFillDislike className="text-dark-blue-s" />
                )}
                {!disliked && !updating && <AiFillDislike />}
                {updating && (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                )}

                <span className="text-xs">{currentProblem.dislikes}</span>
              </div>
              <div
                className="cursor-pointer hover:bg-dark-fill-3  rounded p-[3px]  ml-4 text-xl transition-colors duration-200 text-green-s text-dark-gray-6 "
                onClick={handleStar}
              >
                {starred && !updating && (
                  <AiFillStar className="text-dark-yellow" />
                )}
                {!starred && !updating && <TiStarOutline />}
                {updating && (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-3 flex space-x-2">
              <RectangleSkeleton />
              <CircleSkeleton />
              <RectangleSkeleton />
              <RectangleSkeleton />
              <CircleSkeleton />
            </div>
          )}

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
export default ProblemDescription;

function useGetCurrentProblem(problemId: string) {
  const [currentProblem, setCurrentProblem] = useState<DBProblem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [problemDifficultyClass, setProblemDifficultyClass] =
    useState<string>("");

  useEffect(() => {
    // Get problem from DB
    const getCurrentProblem = async () => {
      setLoading(true);
      const docRef = doc(firestore, "problems", problemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const problem = docSnap.data();
        setCurrentProblem({ id: docSnap.id, ...problem } as DBProblem);
        // easy, medium, hard
        setProblemDifficultyClass(
          problem.difficulty === "Easy"
            ? "bg-olive text-olive"
            : problem.difficulty === "Medium"
            ? "bg-dark-yellow text-dark-yellow"
            : " bg-dark-pink text-dark-pink"
        );
      }
      setLoading(false);
    };
    getCurrentProblem();
  }, [problemId]);

  return { currentProblem, loading, problemDifficultyClass, setCurrentProblem };
}

function useGetUsersDataOnProblem(problemId: string) {
  const [data, setData] = useState({
    liked: false,
    disliked: false,
    starred: false,
    solved: false,
  });
  const [user] = useAuthState(auth);

  useEffect(() => {
    const getUsersDataOnProblem = async () => {
      const userRef = doc(firestore, "users", user!.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const {
          solvedProblems,
          likedProblems,
          dislikedProblems,
          starredProblems,
        } = data;
        setData({
          liked: likedProblems?.includes(problemId), // likedProblems["two-sum","jump-game"]
          disliked: dislikedProblems?.includes(problemId),
          starred: starredProblems?.includes(problemId),
          solved: solvedProblems?.includes(problemId),
        });
      }
    };

    if (user) getUsersDataOnProblem();
    return () =>
      setData({ liked: false, disliked: false, starred: false, solved: false });
  }, [problemId, user]);

  return { ...data, setData };
}
