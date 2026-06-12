import { Card, CardContent } from "@/components/ui/card";
import { TokenData } from "@/types/portfolio";
// import ChartPieDonut from "./chart-pie-donut";

interface ChartOverviewProps {
  tokens: TokenData[];
}

const ChartOverview = ({ tokens }: ChartOverviewProps) => {
  const tokenCount = tokens.length;

  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/5 rounded-xl">
      <CardContent className="p-4 h-full sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg text-muted font-medium">
            Portfolio Distribution
          </span>
          <span className="text-lg text-muted font-medium">
            {tokenCount} {tokenCount === 1 ? "Token" : "Tokens"}
          </span>
        </div>
        <div className="flex justify-center items-center h-full flex-grow">
          {/* <ChartPieDonut tokens={tokens} /> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartOverview;
