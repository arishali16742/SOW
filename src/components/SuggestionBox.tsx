'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Issue } from '@/lib/sow-data';
import { suggestSowImprovements } from '@/ai/flows/suggest-sow-improvements';

interface SuggestionBoxProps {
  selectedIssue: Issue;
  docText: string;
}

export function SuggestionBox({ selectedIssue, docText }: SuggestionBoxProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const { toast } = useToast();

  useEffect(() => {
    const getSuggestions = async () => {
      if (!selectedIssue) return;
      
      setIsLoading(true);
      setSuggestions([]);

      try {
        const result = await suggestSowImprovements({
          sowDocument: docText,
          issueDescription: selectedIssue.description,
          relevantText: selectedIssue.relevantText,
        });

        if (result.suggestedImprovements && result.suggestedImprovements.length > 0) {
          setSuggestions(result.suggestedImprovements);
        } else {
          toast({
            title: 'No Suggestions Found',
            description: 'The AI could not find specific improvements for this issue.',
          });
        }
      } catch (error) {
        console.error('Failed to get suggestions:', error);
        toast({
          title: 'Error Fetching Suggestions',
          description: 'An error occurred while communicating with the AI. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getSuggestions();
  }, [selectedIssue, docText, toast]);

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span>AI Suggestions</span>
        </CardTitle>
        <CardDescription>
          For issue: "{selectedIssue.title}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating suggestions...</span>
          </div>
        ) : suggestions.length > 0 ? (
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="p-3 text-sm border-l-4 rounded-r-md bg-background border-accent">
                {suggestion}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">The AI could not find specific improvements for this issue.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
