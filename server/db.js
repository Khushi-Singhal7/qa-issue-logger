import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'qa_logger.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      prefix TEXT NOT NULL,
      description TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      srNo INTEGER NOT NULL,
      date TEXT NOT NULL,
      module TEXT,
      issue TEXT NOT NULL,
      expectedResult TEXT,
      screenshot TEXT,
      screenshotName TEXT,
      status TEXT NOT NULL,
      severity TEXT,
      remarks TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(projectId);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
  `);

  // Seed sample projects if empty
  const projectCountStmt = db.prepare('SELECT COUNT(*) as count FROM projects');
  const row = projectCountStmt.get();
  const count = row ? Number(row.count) : 0;

  if (count === 0) {
    const now = new Date().toISOString();
    const insertProject = db.prepare(`
      INSERT INTO projects (id, name, prefix, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertProject.run(
      'proj-ecommerce',
      'E-Commerce Web Portal',
      'SHOP',
      'End-to-end regression testing for storefront, payment gateway, and cart flows.',
      now,
      now
    );

    insertProject.run(
      'proj-banking',
      'Mobile Banking App',
      'BANK',
      'Mobile app security, biometric auth, and NEFT/RTGS transaction QA.',
      now,
      now
    );

    const insertIssue = db.prepare(`
      INSERT INTO issues (
        id, projectId, srNo, date, module, issue, expectedResult,
        screenshot, screenshotName, status, severity, remarks, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertIssue.run(
      'issue-demo-1',
      'proj-ecommerce',
      1,
      '2026-09-08',
      'Checkout & Payments',
      'Checkout button becomes unclickable when entering coupon code with special characters.',
      'Discount applies or user receives friendly validation error; checkout button remains clickable.',
      null,
      null,
      'Open',
      'High',
      'Reproduced on Chrome 128 (Windows 11). Console throws Uncaught TypeError.',
      now,
      now
    );

    insertIssue.run(
      'issue-demo-2',
      'proj-ecommerce',
      2,
      '2026-09-09',
      'Authentication',
      'Google Social Sign-In redirects to a blank white screen upon 2FA verification prompt.',
      'User redirected to dashboard with valid active session cookie.',
      null,
      null,
      'In Progress',
      'Critical',
      'Investigating OAuth redirect URI whitelist in staging config.',
      now,
      now
    );

    insertIssue.run(
      'issue-demo-3',
      'proj-ecommerce',
      3,
      '2026-09-09',
      'Cart & Basket',
      'Cart quantity spinner allows entering negative numbers manually.',
      'Quantity field should restrict negative numbers and minimum value should be 1.',
      null,
      null,
      'Resolved',
      'Medium',
      'Fixed in build #1042 with input min="1" restriction.',
      now,
      now
    );

    console.log('[SQLite DB] Initialized and seeded sample projects and issues.');
  }
}

// Project Queries
export function getAllProjects() {
  const stmt = db.prepare('SELECT * FROM projects ORDER BY createdAt ASC');
  return stmt.all();
}

export function getProjectById(id) {
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  return stmt.get(id);
}

export function saveProject(project) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO projects (id, name, prefix, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      prefix = excluded.prefix,
      description = excluded.description,
      updatedAt = excluded.updatedAt
  `);
  stmt.run(
    project.id,
    project.name,
    project.prefix || 'QA',
    project.description || null,
    project.createdAt || now,
    now
  );
  return getProjectById(project.id);
}

export function deleteProject(id) {
  const deleteIssues = db.prepare('DELETE FROM issues WHERE projectId = ?');
  deleteIssues.run(id);
  const deleteProj = db.prepare('DELETE FROM projects WHERE id = ?');
  const result = deleteProj.run(id);
  return result.changes > 0;
}

// Issue Queries
export function getIssuesByProject(projectId) {
  const stmt = db.prepare('SELECT * FROM issues WHERE projectId = ? ORDER BY srNo ASC');
  return stmt.all(projectId);
}

export function getIssueById(id) {
  const stmt = db.prepare('SELECT * FROM issues WHERE id = ?');
  return stmt.get(id);
}

export function getNextSrNo(projectId) {
  const stmt = db.prepare('SELECT COALESCE(MAX(srNo), 0) + 1 AS nextSrNo FROM issues WHERE projectId = ?');
  const result = stmt.get(projectId);
  return result ? Number(result.nextSrNo) : 1;
}

export function saveIssue(issue) {
  const now = new Date().toISOString();
  let srNo = Number(issue.srNo);
  if (!srNo || srNo < 1) {
    srNo = getNextSrNo(issue.projectId);
  }

  const stmt = db.prepare(`
    INSERT INTO issues (
      id, projectId, srNo, date, module, issue, expectedResult,
      screenshot, screenshotName, status, severity, remarks, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      projectId = excluded.projectId,
      srNo = excluded.srNo,
      date = excluded.date,
      module = excluded.module,
      issue = excluded.issue,
      expectedResult = excluded.expectedResult,
      screenshot = excluded.screenshot,
      screenshotName = excluded.screenshotName,
      status = excluded.status,
      severity = excluded.severity,
      remarks = excluded.remarks,
      updatedAt = excluded.updatedAt
  `);

  stmt.run(
    issue.id,
    issue.projectId,
    srNo,
    issue.date || now.split('T')[0],
    issue.module || 'General',
    issue.issue,
    issue.expectedResult || 'Expected to function properly without error',
    issue.screenshot || null,
    issue.screenshotName || null,
    issue.status || 'Open',
    issue.severity || 'Medium',
    issue.remarks || '',
    issue.createdAt || now,
    now
  );

  return getIssueById(issue.id);
}

export function deleteIssue(id) {
  const stmt = db.prepare('DELETE FROM issues WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function bulkUpdateIssueStatus(ids, status) {
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE issues SET status = ?, updatedAt = ? WHERE id = ?');
  let count = 0;
  for (const id of ids) {
    const res = stmt.run(status, now, id);
    count += res.changes;
  }
  return count;
}

export function bulkDeleteIssues(ids) {
  const stmt = db.prepare('DELETE FROM issues WHERE id = ?');
  let count = 0;
  for (const id of ids) {
    const res = stmt.run(id);
    count += res.changes;
  }
  return count;
}

export function syncClientData(projects = [], issues = []) {
  for (const proj of projects) {
    saveProject(proj);
  }
  for (const iss of issues) {
    saveIssue(iss);
  }
  return {
    syncedProjects: projects.length,
    syncedIssues: issues.length,
  };
}
