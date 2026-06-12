import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Loading portfolio data...",
}: LoadingStateProps) {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 flex flex-col justify-center">
      {/* Top section: two cards side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PortfolioStatsCard skeleton */}
        <Card className="glass border-primary/20 shadow-lg shadow-primary/5 rounded-xl">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-3 gap-3 my-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="h-5 w-28 mb-3 mt-2" />
            <div className="space-y-4">
              <div className="h-2 bg-border rounded-full overflow-hidden flex shadow-inner">
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* ChartOverview skeleton */}
        <Card className="border-primary/20 shadow-lg shadow-primary/5 rounded-xl flex flex-col">
          <CardContent className="p-4 h-full sm:p-5 md:p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-center items-center h-full flex-grow">
              <Skeleton className="aspect-square max-h-[250px] w-40 h-40 rounded-full" />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </CardFooter>
        </Card>
      </div>
      {/* TokenBreakdown skeleton */}
      <div className="w-full space-y-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                {["Name", "Price", "Amount"].map((col) => (
                  <th
                    key={col}
                    className="py-3 px-2 text-sm font-medium text-gray-400"
                  >
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-3 px-2" colSpan={3}>
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-center text-muted-foreground text-sm mt-8">
        {message}
      </p>
    </div>
  );
}
