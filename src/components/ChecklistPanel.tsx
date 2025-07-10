'use client';

import React, { useState } from 'react';
import { type Issue, type SowCheck } from '@/lib/sow-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, ScanLine, PlusCircle, Loader2, Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SuggestionBox } from './SuggestionBox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { getDefaultChecks, saveDefaultChecks } from '@/lib/sow-checks-service';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ChecklistPanelProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string) => void;
  docText: string;
  onScan: () => void;
  isScanning: boolean;
  onAddPrompt: (prompt: string) => void;
  isAddingPrompt: boolean;
  onChecksUpdated: (checks: SowCheck[]) => void;
}

export function ChecklistPanel({
  issues,
  selectedIssueId,
  onSelectIssue,
  docText,
  onScan,
  isScanning,
  onAddPrompt,
  isAddingPrompt,
  onChecksUpdated,
}: ChecklistPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isManageChecksOpen, setIsManageChecksOpen] = useState(false);

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt || isAddingPrompt) return;
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
            disabled={isAddingPrompt}
          />
          <Button type="submit" size="icon" variant="ghost" disabled={isAddingPrompt || !customPrompt}>
            {isAddingPrompt ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <PlusCircle className="w-5 h-5" />
            )}
          </Button>
        </form>
        <div className="flex gap-2">
            <Button onClick={onScan} disabled={isScanning} className="w-full">
            {isScanning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <ScanLine className="w-4 h-4 mr-2" />
            )}
            Scan Document
            </Button>
            <Dialog open={isManageChecksOpen} onOpenChange={setIsManageChecksOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Settings className="w-5 h-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <ManageChecksDialog onChecksUpdated={onChecksUpdated} closeModal={() => setIsManageChecksOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
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

// Sub-component for managing checks to keep logic separate
function ManageChecksDialog({ onChecksUpdated, closeModal }: { onChecksUpdated: (checks: SowCheck[]) => void, closeModal: () => void }) {
    const [checks, setChecks] = useState<SowCheck[]>(getDefaultChecks());
    const [newCheckTitle, setNewCheckTitle] = useState('');
    const [newCheckPrompt, setNewCheckPrompt] = useState('');
  
    const handleRemoveCheck = (id: string) => {
      setChecks(prev => prev.filter(c => c.id !== id));
    };
  
    const handleAddCheck = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCheckTitle.trim() || !newCheckPrompt.trim()) return;
      const newCheck: SowCheck = {
        id: `check${Date.now()}`,
        title: newCheckTitle.trim(),
        prompt: newCheckPrompt.trim(),
      };
      setChecks(prev => [...prev, newCheck]);
      setNewCheckTitle('');
      setNewCheckPrompt('');
    };

    const handleSaveChanges = () => {
        saveDefaultChecks(checks);
        onChecksUpdated(checks);
        closeModal();
    };

    return (
      <>
        <DialogHeader>
          <DialogTitle>Manage Default Checks</DialogTitle>
          <DialogDescription>
            Add, remove, or edit the predefined checks that run during a document scan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <h3 className="font-semibold">Current Checks</h3>
                <ScrollArea className="h-72 pr-4">
                    <div className="space-y-2">
                        {checks.map(check => (
                        <div key={check.id} className="flex items-start justify-between p-3 rounded-md border bg-secondary/30">
                            <div>
                                <p className="font-medium text-sm">{check.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{check.prompt}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveCheck(check.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <form onSubmit={handleAddCheck} className="space-y-4">
                <h3 className="font-semibold">Add New Check</h3>
                <div className="space-y-2">
                    <Label htmlFor="new-check-title">Check Title</Label>
                    <Input id="new-check-title" value={newCheckTitle} onChange={e => setNewCheckTitle(e.target.value)} placeholder="e.g., Confidentiality Clause Check" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-check-prompt">AI Instructions / Prompt</Label>
                    <Textarea id="new-check-prompt" value={newCheckPrompt} onChange={e => setNewCheckPrompt(e.target.value)} placeholder="Describe the check logic for the AI..." className="h-44" />
                </div>
                <Button type="submit" className="w-full">Add Check to List</Button>
            </form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </>
    );
  }
