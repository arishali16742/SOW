'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { type AnalysisResult } from '@/lib/sow-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getYear, getQuarter, getMonth, getWeek, format } from 'date-fns';

interface TrendAnalysisProps {
  history: AnalysisResult[];
  isLoading: boolean;
}

type GroupBy = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export function TrendAnalysis({ history, isLoading }: TrendAnalysisProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('monthly');

  const trendData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const groupedData = new Map<string, { total: number; count: number }>();

    history.forEach(analysis => {
      const date = new Date(analysis.date);
      let key: string;

      switch (groupBy) {
        case 'weekly':
          const week = getWeek(date, { weekStartsOn: 1 });
          const yearForWeek = getYear(date);
          key = `${yearForWeek}-W${String(week).padStart(2, '0')}`;
          break;
        case 'monthly':
          key = format(date, 'yyyy-MM');
          break;
        case 'quarterly':
          const quarter = getQuarter(date);
          const yearForQuarter = getYear(date);
          key = `${yearForQuarter}-Q${quarter}`;
          break;
        case 'yearly':
          key = String(getYear(date));
          break;
      }
      
      const entry = groupedData.get(key) || { total: 0, count: 0 };
      entry.total += analysis.failedCount;
      entry.count += 1;
      groupedData.set(key, entry);
    });

    const formattedData = Array.from(groupedData.entries()).map(([name, { total }]) => ({
      name,
      total,
    }));

    // Sort chronologically
    return formattedData.sort((a, b) => a.name.localeCompare(b.name));

  }, [history, groupBy]);

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className='h-80 flex items-center justify-center'>
          <p className="text-muted-foreground">Loading analysis data...</p>
        </div>
      );
    }
  
    if (trendData.length === 0) {
      return (
        <div className='h-80 flex items-center justify-center'>
          <p className="text-muted-foreground">Not enough data to display trend for the selected period.</p>
        </div>
      );
    }

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={trendData}
                margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                />
                <Line type="monotone" dataKey="total" name="Total Issues" stroke="hsl(var(--primary))" strokeWidth={2}>
                    <LabelList dataKey="total" position="top" />
                </Line>
            </LineChart>
            </ResponsiveContainer>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
                <CardTitle>Issue Trend Analysis</CardTitle>
                <CardDescription>Total issue counts over time.</CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Select onValueChange={(value: GroupBy) => setGroupBy(value)} value={groupBy}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weekly">Week-on-Week</SelectItem>
                        <SelectItem value="monthly">Month-on-Month</SelectItem>
                        <SelectItem value="quarterly">Quarter-on-Quarter</SelectItem>
                        <SelectItem value="yearly">Year-on-Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
