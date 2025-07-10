'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChecklistPanel } from '@/components/ChecklistPanel';
import { DocumentViewer } from '@/components/DocumentViewer';
import { initialDocText, type Issue, type AnalysisResult, type SowCheck } from '@/lib/sow-data';
import { useToast } from '@/hooks/use-toast';
import { analyzeSowDocument } from '@/ai/flows/analyze-sow-document';
import { analyzeCustomPrompt } from '@/ai/flows/analyze-custom-prompt';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { getDefaultChecks } from '@/lib/sow-checks-service';

export function SOWiseApp() {
  const [docText, setDocText] = useState(initialDocText);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [sowChecks, setSowChecks] = useState<SowCheck[]>([]);

  useEffect(() => {
    // Load checks from localStorage on mount
    setSowChecks(getDefaultChecks());
  }, []);

  const handleChecksUpdated = (newChecks: SowCheck[]) => {
    setSowChecks(newChecks);
    toast({
      title: 'Checks Updated',
      description: 'Your default checks have been saved.',
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        try {
          const { default: mammoth } = await import('mammoth');
          
          const mammothOptions = {
            styleMap: [
              "b => strong",
              "i => em",
              "u => u",
              "strike => s",
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "p[style-name='Title'] => h1:fresh",
              "p[style-name='Subtitle'] => h2:fresh",
              "p[style-name='Code Block'] => pre:fresh",
            ],
            convertImage: mammoth.images.inline(function(element) {
                return element.read("base64").then(function(imageBuffer) {
                    return {
                        src: "data:" + element.contentType + ";base64," + imageBuffer
                    };
                });
            }),
            transformDocument: (element: any) => {
              function transform(el: any) {
                if (el.children) {
                  el.children = el.children.map(transform);
                }

                if (el.type === 'run' && el.shd && el.shd.fill && el.shd.fill !== 'auto' && el.shd.fill !== 'FFFFFF') {
                   let text = el.children.map((child: any) => child.value).join('');
                   if (text) {
                      const wrap = (tagName: string, content: string) => `<${tagName}>${content}</${tagName}>`;
                      if (el.isStrikethrough) text = wrap('s', text);
                      if (el.isUnderline) text = wrap('u', text);
                      if (el.isItalic) text = wrap('em', text);
                      if (el.isBold) text = wrap('strong', text);
                      return { type: 'raw_html', value: `<mark class="highlight-yellow">${text}</mark>` };
                   }
                }
                
                return el;
              }

              return transform(element);
            }
          };

          const result = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input value to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
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
      const results = await analyzeSowDocument({ 
        sowDocument: docText,
        checks: sowChecks, // Pass the dynamic checks
       });
      
      if (results && results.length > 0) {
        setIssues(results);
        const failedCount = results.filter(i => i.status === 'failed').length;
        toast({
          title: 'Scan Complete',
          description: `${failedCount} issue${failedCount !== 1 ? 's' : ''} found.`,
        });

        // Save results to localStorage
        const totalChecks = results.length;
        const compliance = totalChecks > 0 ? ((totalChecks - failedCount) / totalChecks) * 100 : 100;

        const newResult: AnalysisResult = {
          id: `scan-${Date.now()}`,
          fileName: fileName || 'Untitled Document',
          date: new Date().toISOString(),
          issues: results,
          compliance: Math.round(compliance),
          failedCount,
          totalChecks,
        };

        const history: AnalysisResult[] = JSON.parse(localStorage.getItem('sowise_analysis_history') || '[]');
        history.unshift(newResult);
        localStorage.setItem('sowise_analysis_history', JSON.stringify(history.slice(0, 20))); // Store latest 20 results

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
  
  const handleAddPrompt = async (prompt: string) => {
    if (!prompt || isAddingPrompt) return;

    if (!docText || docText === initialDocText || docText.includes('Loading document')) {
      toast({
        title: 'No Document to Analyze',
        description: 'Please upload a document before adding a custom prompt.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsAddingPrompt(true);
    toast({
      title: 'Analyzing Custom Prompt...',
      description: 'The AI is checking your custom rule.',
    });

    try {
      const result = await analyzeCustomPrompt({
        sowDocument: docText,
        customPrompt: prompt,
      });

      const newIssue: Issue = {
        id: `custom-${Date.now()}`,
        title: prompt, // Use the original prompt as the title
        status: result.status,
        description: result.description,
        relevantText: result.relevantText,
      };

      setIssues(prev => [newIssue, ...prev]);
      toast({
        title: 'Custom Check Complete',
        description: `Result: ${result.status.charAt(0).toUpperCase() + result.status.slice(1)}`,
      });

    } catch (error) {
      console.error('Error with custom prompt:', error);
      toast({
        title: 'Custom Prompt Failed',
        description: 'An error occurred while analyzing the custom prompt.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingPrompt(false);
    }
  };

  const selectedIssue = useMemo(
    () => issues.find(issue => issue.id === selectedIssueId) || null,
    [issues, selectedIssueId]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden font-body text-foreground bg-background">
        <header className="flex items-center justify-between p-4 border-b bg-card">
            <div>
                <h2 className="text-xl font-bold">Upload Document</h2>
                <p className="text-sm text-muted-foreground">{fileName || 'No document uploaded'}</p>
            </div>
            <Button onClick={handleUploadClick}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
        </header>
        <main className="flex flex-1 overflow-hidden transition-all duration-300">
            <ChecklistPanel
              issues={issues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={handleSelectIssue}
              docText={docText}
              onScan={handleScan}
              isScanning={isScanning}
              onAddPrompt={handleAddPrompt}
              isAddingPrompt={isAddingPrompt}
              onChecksUpdated={handleChecksUpdated}
            />
            <DocumentViewer docText={docText} selectedIssue={selectedIssue} />
        </main>
    </div>
  );
}
