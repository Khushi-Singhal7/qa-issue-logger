import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration for local screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'qa-screen-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for screenshots
app.use('/uploads', express.static(uploadsDir));

// Initialize Database schema & default data
db.initDatabase();

// --- REST API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QA Issue Logger Backend',
    database: 'SQLite (node:sqlite)',
    timestamp: new Date().toISOString(),
  });
});

// Projects Endpoints
app.get('/api/projects', (req, res) => {
  try {
    const projects = db.getAllProjects();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { name, prefix, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    const id = req.body.id || `proj-${Date.now()}`;
    const project = db.saveProject({
      id,
      name: name.trim(),
      prefix: (prefix || 'QA').trim().toUpperCase(),
      description: description?.trim() || null,
      createdAt: req.body.createdAt || new Date().toISOString(),
    });
    res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const { name, prefix, description } = req.body;
    const project = db.saveProject({
      ...req.body,
      id: req.params.id,
      name: name ? name.trim() : undefined,
      prefix: prefix ? prefix.trim().toUpperCase() : undefined,
      description: description !== undefined ? description.trim() : undefined,
    });
    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const success = db.deleteProject(req.params.id);
    res.json({ success });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Issues Endpoints
app.get('/api/issues', (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId query param is required' });
    }
    const issues = db.getIssuesByProject(projectId);
    res.json(issues);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

app.get('/api/issues/next-sr', (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }
    const nextSrNo = db.getNextSrNo(projectId);
    res.json({ nextSrNo });
  } catch (err) {
    console.error('Error getting next sr no:', err);
    res.status(500).json({ error: 'Failed to get next sr no' });
  }
});

app.get('/api/issues/:id', (req, res) => {
  try {
    const issue = db.getIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

app.post('/api/issues', (req, res) => {
  try {
    const { projectId, issue: issueDesc } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }
    if (!issueDesc || !issueDesc.trim()) {
      return res.status(400).json({ error: 'Issue description is required' });
    }

    const id = req.body.id || `issue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const saved = db.saveIssue({
      ...req.body,
      id,
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ error: 'Failed to save issue' });
  }
});

app.put('/api/issues/:id', (req, res) => {
  try {
    const saved = db.saveIssue({
      ...req.body,
      id: req.params.id,
    });
    res.json(saved);
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

app.delete('/api/issues/:id', (req, res) => {
  try {
    const success = db.deleteIssue(req.params.id);
    res.json({ success });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

// Bulk status change
app.post('/api/issues/bulk-status', (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !status) {
      return res.status(400).json({ error: 'ids array and status are required' });
    }
    const count = db.bulkUpdateIssueStatus(ids, status);
    res.json({ success: true, count });
  } catch (err) {
    console.error('Error bulk updating status:', err);
    res.status(500).json({ error: 'Failed to bulk update status' });
  }
});

// Bulk delete
app.post('/api/issues/bulk-delete', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const count = db.bulkDeleteIssues(ids);
    res.json({ success: true, count });
  } catch (err) {
    console.error('Error bulk deleting issues:', err);
    res.status(500).json({ error: 'Failed to bulk delete issues' });
  }
});

// Local Screenshot Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Return the relative URL served by this backend
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload screenshot' });
  }
});

// Sync data from client IndexedDB
app.post('/api/sync', (req, res) => {
  try {
    const { projects = [], issues = [] } = req.body;
    const result = db.syncClientData(projects, issues);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

// Start Server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(`  QA Issue Logger Backend REST Server Active!`);
  console.log(`  URL: http://127.0.0.1:${PORT}`);
  console.log(`  Database: SQLite (server/data/qa_logger.db)`);
  console.log(`====================================================`);
});
