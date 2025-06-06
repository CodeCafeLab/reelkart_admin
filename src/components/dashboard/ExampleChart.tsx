"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const chartData = [
  { month: "January", gmv: 18600 },
  { month: "February", gmv: 30500 },
  { month: "March", gmv: 23700 },
  { month: "April", gmv: 17300 },
  { month: "May", gmv: 20900 },
  { month: "June", gmv: 21400 },
]

const chartConfig = {
  gmv: {
    label: "GMV",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ExampleChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GMV Analytics</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis 
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="gmv" fill="var(--color-gmv)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total GMV for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
