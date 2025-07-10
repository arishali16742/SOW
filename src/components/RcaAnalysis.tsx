
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type AnalysisResult } from '@/lib/sow-data';
import { ScrollArea } from './ui/scroll-area';

interface RcaAnalysisProps {
  history: AnalysisResult[];
  isLoading: boolean;
}

export function RcaAnalysis({ history, isLoading }: RcaAnalysisProps) {
  const rcaData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const issueCounts = new Map<string, number>();

    history.forEach(analysis => {
      analysis.issues.forEach(issue => {
        if (issue.status === 'failed') {
          issueCounts.set(issue.title, (issueCounts.get(issue.title) || 0) + (issue.count || 1));
        }
      });
    });

    return Array.from(issueCounts.entries())
      .map(([title, count]) => ({ name: title, total: count }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Show top 10 issues

  }, [history]);

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Root Cause Analysis</CardTitle>
                  <CardDescription>Most frequent issues across all documents.</CardDescription>
              </CardHeader>
              <CardContent className='h-80 flex items-center justify-center'>
                  <p className="text-muted-foreground">Loading analysis data...</p>
              </CardContent>
          </Card>
      )
  }

  if (rcaData.length === 0) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Root Cause Analysis</CardTitle>
            <CardDescription>Most frequent issues across all documents.</CardDescription>
        </CardHeader>
        <CardContent className='h-80 flex items-center justify-center'>
            <p className="text-muted-foreground">No issues found in your analysis history yet.</p>
        </CardContent>
    </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Root Cause Analysis</CardTitle>
        <CardDescription>Most frequent issues across all documents.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Top Issues Chart</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rcaData} layout="vertical" margin={{ right: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis
                            type="category"
                            dataKey="name"
                            width={150}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                            />
                            <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                            />
                            <Bar dataKey="total" name="Failure Count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Issues Breakdown</h3>
                <ScrollArea className="h-80">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Issue Type</TableHead>
                            <TableHead className="text-right">Failure Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rcaData.map(item => (
                            <TableRow key={item.name}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.total}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
