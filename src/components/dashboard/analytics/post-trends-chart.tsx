"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
  type ChartConfig,
} from "@/components/ui/chart"
import type { Post } from "@/lib/types"
import { subDays, format, startOfDay } from "date-fns"

interface PostTrendsChartProps {
    posts: Post[];
}

const processPostData = (posts: Post[]) => {
    const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
    const dailyPosts: { [key: string]: number } = {};

    for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), i), "MMM d");
        dailyPosts[date] = 0;
    }

    posts.forEach(post => {
        const postDate = startOfDay(new Date(post.createdAt));
        if (postDate >= sevenDaysAgo) {
            const dateKey = format(postDate, "MMM d");
            if (dateKey in dailyPosts) {
                dailyPosts[dateKey]++;
            }
        }
    });
    
    return Object.entries(dailyPosts)
        .map(([date, count]) => ({ date, posts: count }))
        .reverse();
}

const chartConfig = {
  posts: {
    label: "New Posts",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function PostTrendsChart({ posts }: PostTrendsChartProps) {
  const chartData = processPostData(posts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Post Creation</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 1,
              right: 1,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
              className="text-xs"
            />
            <YAxis allowDecimals={false} tickMargin={10} axisLine={false} tickLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="posts"
              type="natural"
              stroke="var(--color-posts)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
