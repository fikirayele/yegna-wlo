"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import type { User } from "@/lib/types"
import { subDays, format, startOfDay } from "date-fns"

interface UserTrendsChartProps {
    users: User[];
}

const processUserData = (users: User[]) => {
    const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
    const dailySignups: { [key: string]: number } = {};

    for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), i), "MMM d");
        dailySignups[date] = 0;
    }

    users.forEach(user => {
        const signupDate = startOfDay(new Date(user.createdAt));
        if (signupDate >= sevenDaysAgo) {
            const dateKey = format(signupDate, "MMM d");
            if (dateKey in dailySignups) {
                dailySignups[dateKey]++;
            }
        }
    });

    return Object.entries(dailySignups)
        .map(([date, count]) => ({ date, signups: count }))
        .reverse();
}

const chartConfig = {
  signups: {
    label: "New Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function UserTrendsChart({ users }: UserTrendsChartProps) {
  const chartData = processUserData(users);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New User Sign-ups</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart
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
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 6)}
              className="text-xs"
            />
            <YAxis allowDecimals={false} tickMargin={10} axisLine={false} tickLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="signups"
              fill="var(--color-signups)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
