import Topbar from "@/components/Topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingWorkspaceSkeleton() {
  return (
    <>
      <Topbar />
      <div className="grid grid-cols-2 grid-rows-2 gap-3 h-screen overflow-hidden w-full p-4">
        <Skeleton className="h-full row-span-2 " />
        <Skeleton />
        <Skeleton />
      </div>
    </>
  );
}
