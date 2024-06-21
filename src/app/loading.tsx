import Topbar from "@/components/Topbar/Topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Topbar />
      <div className="container">
        <LoadingTableSkeleton />
      </div>
    </>
  );
}

export const LoadingTableSkeleton = () => {
  return (
    <>
      <Skeleton className="h-12 w-full my-6" />
      {[...Array(10)].map((_, idx) => (
        <div key={idx} className="grid grid-cols-5  gap-12 mt-4 ">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="space-y-2 h-8" />
          <Skeleton className="space-y-2 h-8" />
          <Skeleton className="space-y-2 h-8" />
          <Skeleton className="space-y-2 h-8" />
        </div>
      ))}
    </>
  );
};
