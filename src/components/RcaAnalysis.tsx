
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type AnalysisResult } from '@/lib/sow-data';
import { AlertTriangle, BarChart3 } from 'lucide-react';

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
          issueCounts.set(issue.title, (issueCounts.get(issue.title) || 0) + 1);
        }
      });
    });

    return Array.from(issueCounts.entries())
      .map(([title, count]) => ({ name: title, total: count }))
      .sort((a, b) => b.total - a.total);

  }, [history]);

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent className='h-72 flex items-center justify-center'>
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
        </CardHeader>
        <CardContent className='h-72 flex items-center justify-center'>
            <p className="text-muted-foreground">No issues found in your analysis history yet.</p>
        </CardContent>
    </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Root Cause Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart"><BarChart3 className="w-4 h-4 mr-2" />Chart View</TabsTrigger>
            <TabsTrigger value="table"><AlertTriangle className="w-4 h-4 mr-2" />Table View</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rcaData} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={200}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="table" className="pt-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
