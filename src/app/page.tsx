import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { recentDocuments, type RecentDocument } from '@/lib/sow-data';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  FileText,
  Plus,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
          value="5"
          icon={FileText}
          borderColor="border-blue-500"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Avg Compliance"
          value="22%"
          icon={TrendingUp}
          borderColor="border-green-500"
          iconColor="text-green-500"
        />
        <StatCard
          title="Recent Analyses"
          value="5"
          icon={BarChart2}
          borderColor="border-purple-500"
          iconColor="text-purple-500"
        />
        <StatCard
          title="Critical Issues"
          value="14"
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
            {recentDocuments.map((doc: RecentDocument) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.date}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Analyzed</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
