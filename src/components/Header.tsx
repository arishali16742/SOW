'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Upload, Settings, FileDown, Bot } from 'lucide-react';

interface HeaderProps {
  onUpload: (file: File) => void;
}

export function Header({ onUpload }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset file input value to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };

  return (
    <header className="flex items-center justify-between p-3 border-b bg-card shrink-0">
      <div className="flex items-center gap-2">
        <Bot className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">SOWise</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleUploadClick} variant="outline">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Font Size</DropdownMenuItem>
            <DropdownMenuItem>Formatting Rules</DropdownMenuItem>
            <DropdownMenuItem>Toggle Checks</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Report</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>As PDF</DropdownMenuItem>
            <DropdownMenuItem>As JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
