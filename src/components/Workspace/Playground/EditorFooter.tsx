import { Button } from "@/components/ui/button";
import React from "react";
import { BsChevronUp } from "react-icons/bs";

type EditorFooterProps = {
  handleExecution: (mode: "submit" | "run") => void;
};

const EditorFooter: React.FC<EditorFooterProps> = ({ handleExecution }) => {
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
            執行
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
