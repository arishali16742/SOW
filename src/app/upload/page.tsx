'use client';
import { SOWiseApp } from '@/components/SOWiseApp';
import { Suspense } from 'react';

function UploadPageContent() {
  return (
    <div className="flex-1 overflow-hidden">
      <SOWiseApp />
    </div>
  );
}

export default function UploadPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UploadPageContent />
        </Suspense>
    )
}