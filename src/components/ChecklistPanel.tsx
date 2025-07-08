'use client';

import React, { useState } from 'react';
import { type Issue } from '@/lib/sow-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ScanLine, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SuggestionBox } from './SuggestionBox';

interface ChecklistPanelProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string) => void;
  docText: string;
  onScan: () => void;
  isScanning: boolean;
  onAddPrompt: (prompt: string) => void;
}

export function ChecklistPanel({
  issues,
  selectedIssueId,
  onSelectIssue,
  docText,
  onScan,
  isScanning,
  onAddPrompt,
}: ChecklistPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPrompt(customPrompt);
    setCustomPrompt('');
  };

  const selectedIssue = issues.find(issue => issue.id === selectedIssueId);

  return (
    <aside className="w-full md:w-1/3 xl:w-1/4 flex flex-col border-r h-full bg-card">
      <div className="p-4 space-y-4">
        <form onSubmit={handleAddPrompt} className="flex gap-2">
          <Input 
            placeholder="Add custom prompt..." 
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
          <Button type="submit" size="icon" variant="ghost">
            <PlusCircle className="w-5 h-5" />
          </Button>
        </form>
        <Button onClick={onScan} disabled={isScanning} className="w-full">
          {isScanning ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ScanLine className="w-4 h-4 mr-2" />
          )}
          Scan Document
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 pt-0 space-y-2">
          {issues.map(issue => (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all duration-200',
                selectedIssueId === issue.id
                  ? 'bg-secondary ring-2 ring-primary'
                  : 'bg-background hover:bg-secondary/80'
              )}
            >
              <div className="flex items-center gap-3">
                {issue.status === 'passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                <span className="flex-1 font-medium">{issue.title}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
      {selectedIssue && selectedIssue.status === 'failed' && (
        <div className="p-4 border-t">
          <SuggestionBox
            key={selectedIssue.id}
            selectedIssue={selectedIssue}
            docText={docText}
          />
        </div>
      )}
    </aside>
  );
}
