import Dexie, { Table } from 'dexie';
import { Project, Issue } from '../types/issue';

class IssueLoggerDB extends Dexie {
  projects!: Table<Project, string>;
  issues!: Table<Issue, string>;

  constructor() {
    super('QAIssueLoggerDB');
    this.version(1).stores({
      projects: 'id, name, prefix, createdAt',
      issues: 'id, projectId, srNo, date, status, severity, createdAt',
    });
    this.version(2).stores({
      projects: 'id, name, prefix, createdAt',
      issues: 'id, projectId, srNo, date, module, status, severity, createdAt',
    });
  }
}

export const db = new IssueLoggerDB();

// Automatically handle and recover from any schema or upgrade conflicts
db.open().catch(async (err) => {
  console.warn('Dexie DB open conflict detected, performing graceful auto-recovery:', err);
  try {
    await db.delete();
    await db.open();
    await seedInitialDataIfNeeded();
  } catch (e) {
    console.error('Database auto-recovery failed:', e);
  }
});

// Generate a lightweight SVG placeholder screenshot data URL
export function createPlaceholderScreenshot(title: string, sub: string, color = '#ef4444'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
    <rect width="640" height="360" fill="#1e293b"/>
    <rect x="20" y="20" width="600" height="40" rx="8" fill="#334155"/>
    <circle cx="45" cy="40" r="6" fill="#ef4444"/>
    <circle cx="65" cy="40" r="6" fill="#f59e0b"/>
    <circle cx="85" cy="40" r="6" fill="#10b981"/>
    <rect x="110" y="32" width="280" height="16" rx="4" fill="#475569"/>
    
    <rect x="20" y="80" width="600" height="260" rx="8" fill="#0f172a"/>
    <rect x="60" y="110" width="520" height="50" rx="6" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    <text x="80" y="142" fill="${color}" font-family="monospace" font-size="16" font-weight="bold">ERROR: ${title}</text>
    <text x="80" y="200" fill="#94a3b8" font-family="sans-serif" font-size="14">Observed Behavior:</text>
    <text x="80" y="225" fill="#f8fafc" font-family="sans-serif" font-size="13">${sub}</text>
    
    <text x="80" y="290" fill="#64748b" font-family="monospace" font-size="12">Captured by QA Tester | System Error Log Snapshot</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Initial seed data to give testers an immediate rich preview
export async function seedInitialDataIfNeeded() {
  const projectCount = await db.projects.count();
  if (projectCount > 0) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];

  const project1: Project = {
    id: 'proj-ecommerce',
    name: 'E-Commerce Portal (v2.4)',
    prefix: 'SHOP',
    description: 'B2C web storefront and checkout microservices testing',
    createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    updatedAt: now.toISOString(),
  };

  const project2: Project = {
    id: 'proj-fintech',
    name: 'Mobile Banking & Payments',
    prefix: 'BANK',
    description: 'Customer payment gateway and transaction dashboard',
    createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    updatedAt: now.toISOString(),
  };

  await db.projects.bulkAdd([project1, project2]);

  const sampleIssues: Issue[] = [
    {
      id: 'issue-1',
      projectId: 'proj-ecommerce',
      srNo: 1,
      date: twoDaysAgo,
      module: 'Checkout & Payments',
      issue: 'Checkout payment fails with "500 Internal Server Error" when applying discount coupon SAVE20',
      expectedResult: 'The 20% discount should apply to subtotal and user should navigate smoothly to payment gateway step.',
      screenshot: createPlaceholderScreenshot('500 Internal Server Error at /api/checkout/apply-coupon', 'Coupon code SAVE20 causes null pointer in discount engine', '#ef4444'),
      screenshotName: 'coupon_500_error.png',
      status: 'In Progress',
      severity: 'Critical',
      remarks: 'Reproduced on Chrome 128 / macOS Sequoia & Windows 11. Backend stack trace indicates CouponService.calcDiscount threw NullPointerException.',
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: 'issue-2',
      projectId: 'proj-ecommerce',
      srNo: 2,
      date: yesterday,
      module: 'Product Catalog',
      issue: 'Product image gallery thumbnail carousel fails to render on Safari Mobile (iOS 18)',
      expectedResult: 'All 4 product preview thumbnails should align horizontally and respond to tap gestures.',
      screenshot: createPlaceholderScreenshot('CSS Flexbox Wrap Overflow on Mobile Safari', 'Thumbnails overlapping product description section', '#f59e0b'),
      screenshotName: 'safari_mobile_thumbnails.png',
      status: 'Open',
      severity: 'High',
      remarks: 'Device: iPhone 15 Pro, iOS 18.0 Safari. Desktop browsers render correctly.',
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: 'issue-3',
      projectId: 'proj-ecommerce',
      srNo: 3,
      date: todayStr,
      module: 'Shipping & Delivery',
      issue: 'Address autocomplete dropdown overlaps the "Place Order" button on 768px tablet view',
      expectedResult: 'Address suggestions dropdown should have proper z-index and not obscure action buttons.',
      screenshot: createPlaceholderScreenshot('Z-Index Clashing: Autocomplete List covers CTA Button', 'z-index 10 vs 50 conflict in CheckoutForm.tsx', '#3b82f6'),
      screenshotName: 'address_zindex_bug.png',
      status: 'Resolved',
      severity: 'Medium',
      remarks: 'Dev fixed in commit #89f2a1b. Tested on iPad Air portrait view - verified resolved.',
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'issue-4',
      projectId: 'proj-ecommerce',
      srNo: 4,
      date: todayStr,
      module: 'Order Notifications',
      issue: 'Order confirmation email received with unparsed HTML entities (&amp; instead of &)',
      expectedResult: 'Email body should render decoded plain text or properly sanitized HTML entities.',
      screenshot: createPlaceholderScreenshot('Email Template Escaping Bug', 'Raw &amp; characters visible in Subject line', '#8b5cf6'),
      screenshotName: 'email_template_escape.png',
      status: 'Open',
      severity: 'Low',
      remarks: 'Observed on Gmail Web & Outlook desktop client.',
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'issue-5',
      projectId: 'proj-fintech',
      srNo: 1,
      date: yesterday,
      module: 'Authentication & Security',
      issue: 'Biometric FaceID authentication prompt triggers twice consecutively on cold launch',
      expectedResult: 'FaceID prompt should display only once upon launching the app.',
      screenshot: createPlaceholderScreenshot('Duplicate Auth Intent Triggered', 'App launches two biometric system dialogs', '#ef4444'),
      screenshotName: 'duplicate_faceid_dialog.png',
      status: 'Blocked',
      severity: 'Critical',
      remarks: 'Awaiting native iOS SDK update from security team.',
      createdAt: yesterday,
      updatedAt: yesterday,
    }
  ];

  await db.issues.bulkAdd(sampleIssues);
}

// Database helper operations
export async function getNextSrNo(projectId: string): Promise<number> {
  const issues = await db.issues.where('projectId').equals(projectId).sortBy('srNo');
  if (issues.length === 0) return 1;
  return issues[issues.length - 1].srNo + 1;
}

export async function renumberSrNos(projectId: string) {
  const issues = await db.issues.where('projectId').equals(projectId).sortBy('srNo');
  for (let i = 0; i < issues.length; i++) {
    if (issues[i].srNo !== i + 1) {
      await db.issues.update(issues[i].id, { srNo: i + 1 });
    }
  }
}
