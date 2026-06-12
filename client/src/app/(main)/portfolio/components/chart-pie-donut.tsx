// "use client";

// import { TrendingUp } from "lucide-react";
// import { Pie, PieChart } from "recharts";

// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { TokenData } from "./token-breakdown/constant";

// export const description = "Portfolio asset breakdown by token";

// interface ChartPieDonutProps {
//   tokens: TokenData[];
// }

// function getColor(index: number): string {
//   // Use CSS variables for up to 8 tokens, fallback to gray
//   const colors = [
//     "var(--chart-1)",
//     "var(--chart-2)",
//     "var(--chart-3)",
//     "var(--chart-4)",
//     "var(--chart-5)",
//     "var(--chart-6)",
//     "var(--chart-7)",
//     "var(--chart-8)",
//   ];
//   return colors[index] || "#888888";
// }

// function ChartPieDonut({ tokens }: ChartPieDonutProps) {
//   const chartData = tokens.map((token, i) => ({
//     name: token.symbol,
//     value: token.value, // Use USD value instead of amount
//     fill: getColor(i),
//   }));

//   const chartConfig: ChartConfig = tokens.reduce((acc, token, i) => {
//     acc[token.symbol] = {
//       label: token.symbol,
//       color: getColor(i),
//     };
//     return acc;
//   }, {} as ChartConfig);

//   const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
//   const hasGrowth = tokens.some((token) => token.change24h > 0);
//   const avgChange =
//     tokens.length > 0
//       ? tokens.reduce((sum, token) => sum + token.change24h, 0) / tokens.length
//       : 0;

//   return (
//     <Card className="flex flex-col border-none shadow-none">
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px]"
//         >
//           <PieChart>
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Pie
//               data={chartData}
//               dataKey="value"
//               nameKey="name"
//               innerRadius={60}
//             />
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col gap-2 text-sm">
//         <div className="flex items-center gap-2 leading-none font-medium">
//           {totalValue > 0 && (
//             <>
//               Portfolio value: $
//               {totalValue.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//               {avgChange !== 0 && (
//                 <span
//                   className={`ml-2 ${
//                     avgChange > 0 ? "text-green-400" : "text-red-400"
//                   }`}
//                 >
//                   {avgChange > 0 ? "+" : ""}
//                   {avgChange.toFixed(2)}%
//                 </span>
//               )}
//             </>
//           )}
//           {hasGrowth && <TrendingUp className="h-4 w-4" />}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }

// export default ChartPieDonut;
