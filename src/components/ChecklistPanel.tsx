'use client';

import React, { useState, useEffect } from 'react';
import { type Issue, type SowCheck } from '@/lib/sow-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, ScanLine, PlusCircle, Loader2, Settings, Trash2, Edit } from 'lucide-react';
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
    const [editingCheck, setEditingCheck] = useState<SowCheck | null>(null);
  
    const handleRemoveCheck = (id: string) => {
      setChecks(prev => prev.filter(c => c.id !== id));
      if (editingCheck?.id === id) {
        setEditingCheck(null);
      }
    };
    
    const handleEditClick = (check: SowCheck) => {
      setEditingCheck(check);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCheck || !editingCheck.title.trim() || !editingCheck.prompt.trim()) return;

        setChecks(prev => {
            const existing = prev.find(c => c.id === editingCheck.id);
            if (existing) {
                // Update existing check
                return prev.map(c => c.id === editingCheck.id ? editingCheck : c);
            } else {
                // Add new check
                return [...prev, editingCheck];
            }
        });
        setEditingCheck(null); // Clear form
    };

    const handleCancelEdit = () => {
        setEditingCheck(null);
    }

    const handleAddNewClick = () => {
        setEditingCheck({ id: `check${Date.now()}`, title: '', prompt: '' });
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
                <div className='flex justify-between items-center'>
                    <h3 className="font-semibold">Current Checks</h3>
                    <Button size="sm" variant="outline" onClick={handleAddNewClick} disabled={!!editingCheck}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New
                    </Button>
                </div>
                <ScrollArea className="h-72 pr-4">
                    <div className="space-y-2">
                        {checks.map(check => (
                        <div key={check.id} className="flex items-start justify-between p-3 rounded-md border bg-secondary/30">
                            <div>
                                <p className="font-medium text-sm">{check.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{check.prompt}</p>
                            </div>
                            <div className='flex shrink-0'>
                                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleEditClick(check)} disabled={!!editingCheck}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveCheck(check.id)} disabled={!!editingCheck}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <h3 className="font-semibold">{editingCheck?.id.startsWith('check') && editingCheck.title ? 'Edit Check' : 'Add New Check'}</h3>
                {editingCheck ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="check-title">Check Title</Label>
                            <Input id="check-title" value={editingCheck.title} onChange={e => setEditingCheck({...editingCheck, title: e.target.value})} placeholder="e.g., Confidentiality Clause Check" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="check-prompt">AI Instructions / Prompt</Label>
                            <Textarea id="check-prompt" value={editingCheck.prompt} onChange={e => setEditingCheck({...editingCheck, prompt: e.target.value})} placeholder="Describe the check logic for the AI..." className="h-44" />
                        </div>
                        <div className="flex gap-2">
                           <Button onClick={handleCancelEdit} variant="outline" type="button" className="w-full">Cancel</Button>
                           <Button type="submit" className="w-full">
                            {checks.find(c => c.id === editingCheck.id) ? 'Update Check' : 'Add Check'}
                           </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground bg-secondary/30 rounded-md">
                        <p>Select a check to edit or add a new one.</p>
                    </div>
                )}
            </form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save and Close</Button>
        </DialogFooter>
      </>
    );
  }
