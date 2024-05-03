import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
function ProblemHelp() {
  return (
    <main className="p-5 h-fit grid justify-items-stretch ">
      {/* card list for GPT output */}
      <Card className="border-8  max-w-lg mb-6">
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic minus
          velit porro incidunt quasi expedita inventore aliquam recusandae nam
          consectetur cumque voluptate, est sequi omnis repellat sapiente
          aperiam ullam quod.
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            print("ssss")
          </code>
        </CardContent>
      </Card>

      <Card className="border-8 justify-self-end max-w-md">
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic minus
          velit porro incidunt quasi expedita inventore aliquam recusandae nam
          consectetur cumque voluptate, est sequi omnis repellat sapiente
          aperiam ullam quod.
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            print("ssss")
          </code>
        </CardContent>
      </Card>
    </main>
  );
}

export default ProblemHelp;
