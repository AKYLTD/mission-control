'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Github, Trash2 } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  github_url: string;
  status: string;
  category: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const deleteProject = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <h1 className="text-2xl font-bold">All Projects</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Project</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Category</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Links</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-medium text-white">{project.name}</div>
                    <div className="text-sm text-slate-400">{project.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{project.category}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {project.url && (
                        <a href={project.url} target="_blank" className="p-1 hover:bg-white/10 rounded">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" className="p-1 hover:bg-white/10 rounded">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
