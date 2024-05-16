import { Button } from "@/components/ui/button";
import React from "react";
import { BsChevronUp } from "react-icons/bs";
import { DotLoader } from "react-spinners";

type EditorFooterProps = {
  handleExecution: (mode: "submit" | "run") => void;
  isLoading: boolean;
};

const EditorFooter: React.FC<EditorFooterProps> = ({
  handleExecution,
  isLoading,
}) => {
  return (
    <div className="flex  w-full bg-card">
      <div className="mx-5 my-[10px] flex justify-between w-full">
        <div className="mr-2 flex flex-1 flex-nowrap items-center space-x-4">
          <Button className="">
            Console
            <div className="ml-1 transform transition flex items-center">
              <BsChevronUp className="fill-gray-6 mx-1 fill-dark-gray-6" />
            </div>
          </Button>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Button className="" onClick={() => handleExecution("run")}>
            {isLoading ? (
              <p className="flex place-items-center">
                <DotLoader color="#36d7b7" size={27} />
                {/* <pre>執行中...</pre> */}
              </p>
            ) : (
              "執行"
            )}
          </Button>
          <Button
            className="font-bold	 text-white bg-dark-green-s hover:bg-green-3"
            onClick={() => handleExecution("submit")}
          >
            繳交
          </Button>
        </div>
      </div>
    </div>
  );
};
export default EditorFooter;
