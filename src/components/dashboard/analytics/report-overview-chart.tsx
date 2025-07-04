"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Post } from "@/lib/types"

interface ReportOverviewChartProps {
    posts: Post[];
}

const aggregateReportData = (posts: Post[]) => {
    const reasonCounts = posts.reduce((acc, post) => {
        post.reports.forEach(report => {
            acc[report.reason] = (acc[report.reason] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason, count, fill: `var(--color-${reason.replace(/\s/g, "")})` }))
        .sort((a, b) => b.count - a.count);
}

const chartConfig = {
  HateSpeech: { label: "Hate Speech", color: "hsl(var(--chart-1))" },
  HarassmentorBullying: { label: "Harassment", color: "hsl(var(--chart-2))" },
  SpamorScams: { label: "Spam/Scams", color: "hsl(var(--chart-3))" },
  IllegalActivities: { label: "Illegal Activities", color: "hsl(var(--chart-4))" },
  GraphicViolence: { label: "Graphic Violence", color: "hsl(var(--chart-5))" },
  SexuallyExplicitContent: { label: "Explicit Content" },
  Other: { label: "Other" },
} satisfies ChartConfig

export function ReportOverviewChart({ posts }: ReportOverviewChartProps) {
  const chartData = aggregateReportData(posts);
  const totalReports = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Report Reasons</CardTitle>
        <CardDescription>Breakdown of all report reasons</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-64"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="reason"
              innerRadius={60}
              strokeWidth={5}
            />
             <ChartLegend
                content={<ChartLegendContent nameKey="reason" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
