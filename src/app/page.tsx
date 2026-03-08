'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Plus, Zap, Shield, TrendingUp } from 'lucide-react';

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
  health?: {
    performance?: number;
    security?: string;
    uptime?: string;
  };
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: projects.length,
    healthy: projects.filter(p => p.status === 'active').length,
    issues: projects.filter(p => p.status === 'warning' || p.status === 'error').length,
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Activity className="w-5 h-5" />} 
          label="Total Projects" 
          value={stats.total.toString()} 
          color="teal"
        />
        <StatCard 
          icon={<CheckCircle className="w-5 h-5" />} 
          label="Healthy" 
          value={stats.healthy.toString()} 
          color="green"
        />
        <StatCard 
          icon={<AlertTriangle className="w-5 h-5" />} 
          label="Issues" 
          value={stats.issues.toString()} 
          color="yellow"
        />
        <StatCard 
          icon={<Clock className="w-5 h-5" />} 
          label="Last Scan" 
          value="Just now" 
          color="blue"
        />
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-white/10">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 mb-4">Add your first project to start monitoring</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition text-sm"
            >
              Add Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
            ))}
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <AddProjectModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            fetchProjects();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  };
  const iconColors: Record<string, string> = {
    teal: 'text-teal-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={iconColors[color]}>{icon}</div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [scanning, setScanning] = useState(false);

  const runScan = async () => {
    setScanning(true);
    try {
      await fetch(`/api/projects/${project.id}/scan`, { method: 'POST' });
      onUpdate();
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    inactive: 'bg-slate-500',
  };

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5 card-glow hover:border-teal-500/50 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-xl">
            {project.category === 'web' ? '🌐' : project.category === 'api' ? '⚡' : '📦'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{project.name}</h3>
            <p className="text-xs text-slate-400">{project.url || 'No URL'}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[project.status]} status-dot`} />
      </div>

      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
        {project.description || 'No description'}
      </p>

      {/* Health Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <Zap className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
          <p className="text-xs text-slate-400">Perf</p>
          <p className="text-sm font-medium text-white">{project.health?.performance || '--'}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <Shield className="w-4 h-4 mx-auto text-green-400 mb-1" />
          <p className="text-xs text-slate-400">Security</p>
          <p className="text-sm font-medium text-white">{project.health?.security || '--'}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <TrendingUp className="w-4 h-4 mx-auto text-blue-400 mb-1" />
          <p className="text-xs text-slate-400">Uptime</p>
          <p className="text-sm font-medium text-white">{project.health?.uptime || '--'}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex-1 px-3 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 rounded-lg text-sm transition disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : '🔍 Run Scan'}
        </button>
        <a
          href={`/projects/${project.id}`}
          className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
        >
          Details
        </a>
      </div>
    </div>
  );
}

function AddProjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', url: '', github_url: '', category: 'web' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    setSaving(true);
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-white/10 rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-white mb-4">Add New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Project Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:border-teal-500 outline-none"
              placeholder="My Awesome Project"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:border-teal-500 outline-none resize-none"
              placeholder="What does this project do?"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Live URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:border-teal-500 outline-none"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">GitHub URL</label>
            <input
              type="url"
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:border-teal-500 outline-none"
              placeholder="https://github.com/user/repo"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:border-teal-500 outline-none"
            >
              <option value="web">🌐 Web App</option>
              <option value="api">⚡ API</option>
              <option value="mobile">📱 Mobile</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
