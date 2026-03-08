import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'projects.json');

// Ensure data directory and file exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  github_url: string;
  status: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface HealthCheck {
  id: number;
  project_id: number;
  check_type: string;
  status: string;
  score: number | null;
  details: string;
  checked_at: string;
}

interface ScanResult {
  id: number;
  project_id: number;
  scan_type: string;
  issues: string;
  suggestions: string;
  scanned_at: string;
}

interface Data {
  projects: Project[];
  health_checks: HealthCheck[];
  scan_results: ScanResult[];
  next_id: { projects: number; health_checks: number; scan_results: number };
}

function loadData(): Data {
  try {
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return {
    projects: [],
    health_checks: [],
    scan_results: [],
    next_id: { projects: 1, health_checks: 1, scan_results: 1 }
  };
}

function saveData(data: Data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Project functions
export function getAllProjects() {
  const data = loadData();
  return data.projects.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getProject(id: number) {
  const data = loadData();
  return data.projects.find(p => p.id === id);
}

export function createProject(input: { name: string; description?: string; url?: string; github_url?: string; category?: string }) {
  const data = loadData();
  const now = new Date().toISOString();
  const project: Project = {
    id: data.next_id.projects++,
    name: input.name,
    description: input.description || '',
    url: input.url || '',
    github_url: input.github_url || '',
    status: 'active',
    category: input.category || 'web',
    created_at: now,
    updated_at: now,
  };
  data.projects.push(project);
  saveData(data);
  return project.id;
}

export function updateProject(id: number, updates: Partial<Project>) {
  const data = loadData();
  const idx = data.projects.findIndex(p => p.id === id);
  if (idx !== -1) {
    data.projects[idx] = { ...data.projects[idx], ...updates, updated_at: new Date().toISOString() };
    saveData(data);
  }
}

export function deleteProject(id: number) {
  const data = loadData();
  data.projects = data.projects.filter(p => p.id !== id);
  saveData(data);
}

// Health check functions
export function getLatestHealthCheck(projectId: number, checkType: string) {
  const data = loadData();
  return data.health_checks
    .filter(h => h.project_id === projectId && h.check_type === checkType)
    .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())[0];
}

export function saveHealthCheck(input: { project_id: number; check_type: string; status: string; score?: number; details?: string }) {
  const data = loadData();
  const check: HealthCheck = {
    id: data.next_id.health_checks++,
    project_id: input.project_id,
    check_type: input.check_type,
    status: input.status,
    score: input.score || null,
    details: input.details || '',
    checked_at: new Date().toISOString(),
  };
  data.health_checks.push(check);
  saveData(data);
}

// Scan result functions
export function saveScanResult(input: { project_id: number; scan_type: string; issues: string; suggestions: string }) {
  const data = loadData();
  const result: ScanResult = {
    id: data.next_id.scan_results++,
    project_id: input.project_id,
    scan_type: input.scan_type,
    issues: input.issues,
    suggestions: input.suggestions,
    scanned_at: new Date().toISOString(),
  };
  data.scan_results.push(result);
  saveData(data);
}

export function getLatestScan(projectId: number, scanType: string) {
  const data = loadData();
  return data.scan_results
    .filter(s => s.project_id === projectId && s.scan_type === scanType)
    .sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())[0];
}
