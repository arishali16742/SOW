export interface Issue {
  id: string;
  title: string;
  status: 'passed' | 'failed';
  description: string;
  relevantText: string;
}

export interface RecentDocument {
  id: string;
  title: string;
  date: string;
  status: 'Analyzed' | 'Pending';
}

export const initialDocText = `<h1>Welcome to SOWise!</h1><p>Please upload a .docx document to get started.</p><p>Or navigate to the Dashboard to see your analysis history.</p>`;

// Issues are now generated dynamically by the AI, so we start with an empty array.
export const initialIssues: Issue[] = [];

export const recentDocuments: RecentDocument[] = [
  {
    id: 'doc1',
    title: 'Google Cloud Professional Services Statement of Work: GKE Foundation as a Service Platform',
    date: 'Jul 7, 2025 at 8:07 PM',
    status: 'Analyzed',
  },
  {
    id: 'doc2',
    title: 'Google Cloud Professional Services SOW for GKE Foundation as a Service',
    date: 'Jul 7, 2025 at 4:59 PM',
    status: 'Analyzed',
  },
  {
    id: 'doc3',
    title: 'Google Kubernetes Engine Foundation as a Service Platform',
    date: 'Jul 6, 2025 at 11:23 AM',
    status: 'Analyzed',
  },
];
