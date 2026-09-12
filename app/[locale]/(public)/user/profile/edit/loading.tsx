import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20" role="status" aria-label="Loading profile"><Skeleton className="size-32 rounded-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><span className="sr-only">Loading profile…</span></div>;
}
