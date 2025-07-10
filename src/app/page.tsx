'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AnalysisResult, type Issue } from '@/lib/sow-data';
import {
  AlertTriangle,
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
import { RcaAnalysis } from '@/components/RcaAnalysis';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { getYear, getQuarter, getMonth, getWeek, startOfWeek, endOfWeek, format, isWithinInterval } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    avgCompliance: 0,
    avgIssues: 0,
    totalIssues: 0,
  });
  const [fullHistory, setFullHistory] = useState<AnalysisResult[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  const filterOptions = useMemo(() => {
    const years = [...new Set(fullHistory.map(item => getYear(new Date(item.date))))].sort((a,b) => b-a);
    
    let yearToFilter = selectedYear !== 'all' ? parseInt(selectedYear, 10) : new Date().getFullYear();

    const dataInYear = fullHistory.filter(item => getYear(new Date(item.date)) === yearToFilter);
    
    const quarters = [...new Set(dataInYear.map(item => getQuarter(new Date(item.date))))].sort((a,b) => a-b);
    
    let quarterToFilter = selectedQuarter !== 'all' ? parseInt(selectedQuarter, 10) : null;
    let dataInQuarter = dataInYear;
    if (quarterToFilter) {
      dataInQuarter = dataInYear.filter(item => getQuarter(new Date(item.date)) === quarterToFilter);
    }
    const months = [...new Set(dataInQuarter.map(item => getMonth(new Date(item.date))))].sort((a,b) => a-b);

    let monthToFilter = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) : null;
    let dataInMonth = dataInQuarter;
    if (monthToFilter !== null) {
        dataInMonth = dataInQuarter.filter(item => getMonth(new Date(item.date)) === monthToFilter);
    }
    const weeks = [...new Set(dataInMonth.map(item => getWeek(new Date(item.date), {weekStartsOn: 1})))].sort((a,b) => b-a);

    return { years, quarters, months, weeks };
  }, [fullHistory, selectedYear, selectedQuarter, selectedMonth]);

  useEffect(() => {
    // Client-side only
    const storedHistory = localStorage.getItem('sowise_analysis_history');
    if (storedHistory) {
      const parsedHistory: AnalysisResult[] = JSON.parse(storedHistory);
      setFullHistory(parsedHistory);
      setFilteredHistory(parsedHistory);
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    let newFilteredHistory = fullHistory;

    if (selectedYear !== 'all') {
      const yearNum = parseInt(selectedYear, 10);
      newFilteredHistory = newFilteredHistory.filter(item => getYear(new Date(item.date)) === yearNum);
    }
    if (selectedQuarter !== 'all') {
      const quarterNum = parseInt(selectedQuarter, 10);
      newFilteredHistory = newFilteredHistory.filter(item => getQuarter(new Date(item.date)) === quarterNum);
    }
    if (selectedMonth !== 'all') {
      const monthNum = parseInt(selectedMonth, 10);
      newFilteredHistory = newFilteredHistory.filter(item => getMonth(new Date(item.date)) === monthNum);
    }
    if (selectedWeek !== 'all') {
      const weekNum = parseInt(selectedWeek, 10);
      newFilteredHistory = newFilteredHistory.filter(item => getWeek(new Date(item.date), { weekStartsOn: 1 }) === weekNum);
    }
    
    setFilteredHistory(newFilteredHistory);
  }, [selectedYear, selectedQuarter, selectedMonth, selectedWeek, fullHistory]);

  useEffect(() => {
    if (fullHistory.length > 0 && !isLoading) {
        const historyToProcess = filteredHistory;
        
        const totalDocuments = historyToProcess.length;
        const totalIssues = historyToProcess.reduce(
            (acc, doc) => acc + doc.failedCount,
            0
        );
        const totalCompliance = historyToProcess.reduce(
            (acc, doc) => acc + doc.compliance,
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
    } else if (!isLoading) {
        // Reset stats if there's no data for the filter
        setStats({ totalDocuments: 0, avgCompliance: 0, avgIssues: 0, totalIssues: 0 });
    }
  }, [filteredHistory, fullHistory, isLoading]);


  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedQuarter('all');
    setSelectedMonth('all');
    setSelectedWeek('all');
  }

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter);
    setSelectedMonth('all');
    setSelectedWeek('all');
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedWeek('all');
  }

  const getWeekLabel = (weekNum: number) => {
    const year = selectedYear !== 'all' ? parseInt(selectedYear, 10) : new Date().getFullYear();
    const firstDayOfYear = new Date(year, 0, 4); 
    const dateInWeek = new Date(firstDayOfYear.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
    
    while(getWeek(dateInWeek, {weekStartsOn: 1}) < weekNum) {
        dateInWeek.setDate(dateInWeek.getDate() + 1);
    }
    while(getWeek(dateInWeek, {weekStartsOn: 1}) > weekNum) {
        dateInWeek.setDate(dateInWeek.getDate() - 1);
    }

    const firstDay = startOfWeek(dateInWeek, { weekStartsOn: 1 });
    const lastDay = endOfWeek(dateInWeek, { weekStartsOn: 1 });
    return `Week ${weekNum}: ${format(firstDay, 'MMM d')} - ${format(lastDay, 'MMM d, yyyy')}`;
  }
  
  const recentDocs = filteredHistory.slice(0, 5);

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
          title="Avg. Compliance"
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
            <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select onValueChange={handleYearChange} value={selectedYear}>
                <SelectTrigger>
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {filterOptions.years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select onValueChange={handleQuarterChange} value={selectedQuarter} disabled={selectedYear === 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    {filterOptions.quarters.map(q => <SelectItem key={q} value={String(q)}>Quarter {q}</SelectItem>)}
                </SelectContent>
            </Select>
            
            <Select onValueChange={handleMonthChange} value={selectedMonth} disabled={selectedQuarter === 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {filterOptions.months.map(m => <SelectItem key={m} value={String(m)}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select onValueChange={setSelectedWeek} value={selectedWeek} disabled={selectedMonth === 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Weeks</SelectItem>
                    {filterOptions.weeks.map(w => <SelectItem key={w} value={String(w)}>{getWeekLabel(w)}</SelectItem>)}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>

      <RcaAnalysis history={filteredHistory} isLoading={isLoading} />
      
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
                No analyses found for the selected filter.
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
