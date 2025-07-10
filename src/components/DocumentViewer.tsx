'use client';

import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Issue } from '@/lib/sow-data';

interface DocumentViewerProps {
  docText: string;
  selectedIssue: Issue | null;
}

export function DocumentViewer({ docText, selectedIssue }: DocumentViewerProps) {
  useEffect(() => {
    if (selectedIssue) {
      const element = document.getElementById('highlight-span');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedIssue]);

  const createHighlightedHtml = () => {
    let textForDisplay = docText;

    const highlightText = selectedIssue?.relevantText;
    if (highlightText && selectedIssue.status === 'failed') {
      const escapedHighlightText = highlightText.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      // Replace only the first occurrence to attach the ID
      let replaced = false;
      textForDisplay = textForDisplay.replace(new RegExp(escapedHighlightText, 'g'), (match) => {
        if (!replaced) {
          replaced = true;
          return `<mark id="highlight-span" class="bg-red-100 text-red-900 rounded px-1 py-0.5 scroll-mt-24">${match}</mark>`;
        }
        return `<mark class="bg-red-100 text-red-900 rounded px-1 py-0.5">${match}</mark>`;
      });
    }

    return { __html: textForDisplay };
  };

  return (
    <div className="flex-1 h-full bg-white text-gray-800">
      <ScrollArea className="h-full">
        <div
          className="p-8 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={createHighlightedHtml()}
        />
      </ScrollArea>
    </div>
  );
}
