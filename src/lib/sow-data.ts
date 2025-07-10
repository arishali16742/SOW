export interface Issue {
  id: string;
  title: string;
  status: 'passed' | 'failed';
  description: string;
  relevantText: string;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  date: string; // ISO string
  issues: Issue[];
  compliance: number; // 0-100
  failedCount: number;
  totalChecks: number;
}

export interface SowCheck {
    id: string;
    title: string;
    prompt: string;
}

export const initialDocText = `<h1>Welcome to SOWise!</h1><p>Please upload a .docx document to get started.</p><p>You can do this by clicking the "Upload Document" button in the header.</p><p>After uploading, you'll be able to scan the document for compliance issues and see AI-powered suggestions for improvements.</p><p>Navigate to the Dashboard to see your analysis history.</p>`;

// Issues are now generated dynamically by the AI, so we start with an empty array.
export const initialIssues: Issue[] = [];
