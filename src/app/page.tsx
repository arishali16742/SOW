'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AnalysisResult } from '@/lib/sow-data';
import {
  AlertTriangle,
  BarChart2,
  FileText,
  Plus,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    avgCompliance: 0,
    recentAnalyses: 0,
    criticalIssues: 0,
  });
  const [recentDocs, setRecentDocs] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side only
    const storedHistory = localStorage.getItem('sowise_analysis_history');
    if (storedHistory) {
      const history: AnalysisResult[] = JSON.parse(storedHistory);

      if (history.length > 0) {
        const totalDocuments = history.length;
        const totalCompliance = history.reduce(
          (acc, doc) => acc + doc.compliance,
          0
        );
        const avgCompliance =
          totalDocuments > 0 ? Math.round(totalCompliance / totalDocuments) : 0;
        const criticalIssues = history.reduce(
          (acc, doc) => acc + doc.failedCount,
          0
        );

        setStats({
          totalDocuments,
          avgCompliance,
          recentAnalyses: totalDocuments,
          criticalIssues,
        });
        setRecentDocs(history.slice(0, 5)); // Show latest 5
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your SOW document compliance and analysis history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/upload">
              <Plus className="mr-2 h-4 w-4" /> New Analysis
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documents"
          value={isLoading ? '...' : stats.totalDocuments.toString()}
          icon={FileText}
          borderColor="border-blue-500"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Avg Compliance"
          value={isLoading ? '...' : `${stats.avgCompliance}%`}
          icon={TrendingUp}
          borderColor="border-green-500"
          iconColor="text-green-500"
        />
        <StatCard
          title="Recent Analyses"
          value={isLoading ? '...' : stats.recentAnalyses.toString()}
          icon={BarChart2}
          borderColor="border-purple-500"
          iconColor="text-purple-500"
        />
        <StatCard
          title="Total Issues"
          value={isLoading ? '...' : stats.criticalIssues.toString()}
          icon={AlertTriangle}
          borderColor="border-red-500"
          iconColor="text-red-500"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading history...</p>
            ) : recentDocs.length > 0 ? (
              recentDocs.map((doc: AnalysisResult) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-semibold',
                      doc.compliance >= 80
                        ? 'bg-green-100 text-green-800'
                        : doc.compliance >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    )}
                  >
                    {doc.compliance}% Compliant
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No analyses performed yet. Upload a document to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
