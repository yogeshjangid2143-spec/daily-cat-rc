'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  fullDate?: string;
  scorePercent: number;
  rawScore: string;
}

interface ScoreChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#18181B] border border-[#E5E5E3] dark:border-[#27272A] p-3 rounded shadow-none text-xs font-mono">
        <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">
          {payload[0].payload.fullDate || payload[0].payload.date}
        </p>
        <p className="text-[#1A1A18] dark:text-[#FAFAF9]">
          Accuracy: <span className="font-bold text-[#4F46E5] dark:text-[#6366F1]">{payload[0].value}%</span>
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
          Score: {payload[0].payload.rawScore}
        </p>
      </div>
    );
  }
  return null;
};

export default function ScoreChart({ data }: ScoreChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[240px] w-full flex items-center justify-center bg-gray-50 dark:bg-black/10 rounded-md border border-[#E5E5E3] dark:border-[#27272A]">
        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono animate-pulse">
          Loading performance chart...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[240px] w-full flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-black/10 rounded-md border border-dashed border-[#E5E5E3] dark:border-[#27272A] p-4">
        <p className="text-sm font-semibold text-[#1A1A18] dark:text-[#FAFAF9]">No attempts yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Solve your first daily Reading Comprehension to see performance trends!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[240px] outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E5E3"
            vertical={false}
            className="dark:stroke-[#27272A]"
          />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={10}
            className="font-mono"
          />
          <YAxis
            stroke="#888888"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            dx={-5}
            className="font-mono"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.3 }} />
          <Line
            type="monotone"
            dataKey="scorePercent"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 1, fill: '#FFFFFF', stroke: '#4F46E5' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
            className="dark:stroke-[#6366F1]"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
