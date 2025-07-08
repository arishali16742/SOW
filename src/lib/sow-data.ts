export interface Issue {
  id: string;
  title: string;
  status: 'passed' | 'failed';
  description: string;
  relevantText: string;
}

export const initialDocText = `<h1>Welcome to SOWise!</h1><p>Please upload a .docx document to get started.</p>`;

// Issues are now generated dynamically by the AI, so we start with an empty array.
export const initialIssues: Issue[] = [];
