'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'A pie chart displaying project statuses';

interface ProjectsPieChartProps {
  completed: number;
  active: number;
  total: number;
}

const chartConfig = {
  projects: {
    label: 'Projects',
  },
  completed: {
    label: 'Completed',
    color: 'var(--chart-1)',
  },
  active: {
    label: 'Active',
    color: 'var(--chart-2)',
  },
  other: {
    label: 'Other',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export function ProjectsPieChart({
  completed,
  active,
  total,
}: ProjectsPieChartProps) {
  const chartData = [
    { status: 'completed', count: completed, fill: 'var(--color-completed)' },
    { status: 'active', count: active, fill: 'var(--color-active)' },
    {
      status: 'other',
      count: total - (completed + active),
      fill: 'var(--color-other)',
    },
  ];

  return (
    <Card className="bg-bground-1 flex w-full flex-col rounded-3xl border-none shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Projects Status Chart</CardTitle>
        <CardDescription>Current Project Breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" label nameKey="status" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Project activity trending <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing project status distribution
        </div>
      </CardFooter>
    </Card>
  );
}
