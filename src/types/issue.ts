export type IssueStatus =
  | 'Open'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Blocked'
  | 'Reopened';

export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Project {
  id: string;
  name: string;
  prefix: string; // e.g., 'QA', 'SHOP', 'CRM'
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  projectId: string;
  srNo: number; // Sr. No. sequential for this project
  date: string; // YYYY-MM-DD
  module: string; // Module / Feature area e.g. Checkout, Auth, Dashboard
  issue: string; // Issue / Error description
  expectedResult: string; // Expected Result
  screenshot?: string; // Base64 data URL
  screenshotName?: string;
  status: IssueStatus;
  severity?: IssueSeverity;
  remarks: string; // Remarks / environment details / notes
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  search: string;
  module: string; // 'ALL' or specific module name
  status: string; // 'ALL' or IssueStatus
  severity: string; // 'ALL' or IssueSeverity
  startDate: string;
  endDate: string;
  sortBy: 'srNo' | 'date' | 'status' | 'severity';
  sortOrder: 'asc' | 'desc';
}

export interface ExportData {
  version: string;
  exportDate: string;
  project: Project;
  issues: Issue[];
}
