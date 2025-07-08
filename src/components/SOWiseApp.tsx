'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ChecklistPanel } from '@/components/ChecklistPanel';
import { DocumentViewer } from '@/components/DocumentViewer';
import { initialDocText, type Issue } from '@/lib/sow-data';
import { useToast } from '@/hooks/use-toast';
import { analyzeSowDocument } from '@/ai/flows/analyze-sow-document';

export function SOWiseApp() {
  const [docText, setDocText] = useState(initialDocText);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a .docx file.',
        variant: 'destructive',
      });
      return;
    }

    setDocText('<h2>Loading document...</h2>');
    setIssues([]);
    setSelectedIssueId(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        try {
          const { default: mammoth } = await import('mammoth');
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocText(result.value);
          toast({
            title: 'File Uploaded',
            description: `Successfully processed "${file.name}". Ready to scan.`,
          });
        } catch (error) {
          console.error('Error parsing document:', error);
          toast({
            title: 'Error processing file',
            description: 'Could not read the document content.',
            variant: 'destructive',
          });
          setDocText(initialDocText); // Reset on error
        }
      }
    };
    reader.onerror = (error) => {
        console.error('File read error:', error);
        toast({
            title: 'File Read Error',
            description: 'There was an error reading the file.',
            variant: 'destructive',
        });
        setDocText(initialDocText); // Reset on error
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectIssue = (issueId: string) => {
    setSelectedIssueId(prevId => (prevId === issueId ? null : issueId));
  };

  const handleScan = async () => {
    if (!docText || docText === initialDocText || docText.includes('Loading document')) {
      toast({
        title: 'No Document to Scan',
        description: 'Please upload a document first.',
        variant: 'destructive',
      });
      return;
    }

    setIsScanning(true);
    setIssues([]);
    setSelectedIssueId(null);
    toast({
      title: 'Scanning Document...',
      description: 'AI is analyzing your document. This may take a moment.',
    });
    
    try {
      const results = await analyzeSowDocument({ sowDocument: docText });
      
      if (results && results.length > 0) {
        setIssues(results);
        const failedCount = results.filter(i => i.status === 'failed').length;
        toast({
          title: 'Scan Complete',
          description: `${failedCount} issue${failedCount !== 1 ? 's' : ''} found.`,
        });
      } else {
        toast({
          title: 'Scan Complete',
          description: 'No issues found, or the AI could not process the document.',
        });
        setIssues([]); // Ensure issues are cleared if no results
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      toast({
        title: 'Scan Failed',
        description: 'An error occurred while analyzing the document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleAddPrompt = (prompt: string) => {
    if (!prompt) return;
    const newIssue: Issue = {
      id: `custom-${Date.now()}`,
      title: prompt,
      status: 'failed', // Assume custom prompts find issues
      description: `Custom check for: "${prompt}"`,
      relevantText: 'This document is a DRAFT.', // Placeholder relevant text
    };
    setIssues(prev => [newIssue, ...prev]);
    toast({
      title: 'Custom Prompt Added',
      description: 'The new check has been added to the list.',
    });
  };

  const selectedIssue = useMemo(
    () => issues.find(issue => issue.id === selectedIssueId) || null,
    [issues, selectedIssueId]
  );

  return (
    <div className="flex flex-col h-screen bg-background font-body text-foreground overflow-hidden">
      <Header onUpload={handleFileUpload} />
      <main className="flex flex-1 overflow-hidden transition-all duration-300">
        <ChecklistPanel
          issues={issues}
          selectedIssueId={selectedIssueId}
          onSelectIssue={handleSelectIssue}
          docText={docText}
          onScan={handleScan}
          isScanning={isScanning}
          onAddPrompt={handleAddPrompt}
        />
        <DocumentViewer docText={docText} selectedIssue={selectedIssue} />
      </main>
    </div>
  );
}
