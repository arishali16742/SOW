'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AnalysisResult, type Issue } from '@/lib/sow-data';
import {
  AlertTriangle,
  BarChart2,
  FileText,
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    avgCompliance: 0,
    avgIssues: 0,
    totalIssues: 0,
  });
  const [recentDocs, setRecentDocs] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

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
        const totalIssues = history.reduce(
          (acc, doc) => acc + doc.failedCount,
          0
        );
        const avgCompliance =
          totalDocuments > 0 ? Math.round(totalCompliance / totalDocuments) : 0;
        const avgIssues = totalDocuments > 0 ? parseFloat((totalIssues / totalDocuments).toFixed(1)) : 0;

        setStats({
          totalDocuments,
          avgCompliance,
          avgIssues,
          totalIssues,
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
          title="Avg. Issues / Doc"
          value={isLoading ? '...' : stats.avgIssues.toString()}
          icon={ListChecks}
          borderColor="border-purple-500"
          iconColor="text-purple-500"
        />
        <StatCard
          title="Total Issues Found"
          value={isLoading ? '...' : stats.totalIssues.toString()}
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
                <button
                  key={doc.id}
                  onClick={() => setSelectedAnalysis(doc)}
                  className="flex w-full items-center justify-between rounded-lg border bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
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
                </button>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No analyses performed yet. Upload a document to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AnalysisResultDialog 
        analysis={selectedAnalysis}
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />
    </div>
  );
}

interface AnalysisResultDialogProps {
    analysis: AnalysisResult | null;
    isOpen: boolean;
    onClose: () => void;
}

function AnalysisResultDialog({ analysis, isOpen, onClose }: AnalysisResultDialogProps) {
    if (!analysis) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{analysis.fileName}</DialogTitle>
                    <DialogDescription>
                        Analyzed on {new Date(analysis.date).toLocaleString()}. 
                        Found {analysis.failedCount} issue(s) out of {analysis.totalChecks} checks.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4 py-4">
                        {analysis.issues.map((issue: Issue) => (
                            <div key={issue.id} className="p-3 rounded-lg border bg-background">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {issue.status === 'passed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        )}
                                        <span className="font-medium text-sm">{issue.title}</span>
                                    </div>
                                    {issue.status === 'failed' && issue.count && issue.count > 0 && (
                                        <Badge variant="destructive">{issue.count} found</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 pl-8">{issue.description}</p>
                                {issue.status === 'failed' && issue.relevantText && (
                                    <div className='mt-2 pl-8'>
                                        <p className="text-xs text-muted-foreground border-l-2 pl-2 italic">
                                            Relevant text: "{issue.relevantText}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button asChild>
                      <Link href={`/upload?analysisId=${analysis.id}`}>View Full Report</Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
