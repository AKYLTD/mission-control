'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Github, RefreshCw, Shield, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  github_url: string;
  status: string;
  category: string;
  health?: {
    performance: number | null;
    security: string | null;
    uptime: string | null;
  };
}

interface ScanResult {
  performance: number;
  security: string;
  uptime: string;
  issues: string[];
  suggestions: string[];
  responseTime?: number;
  statusCode?: number;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then(res => res.json())
      .then(data => setProject(data.project))
      .finally(() => setLoading(false));
  }, [params.id]);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`/api/projects/${params.id}/scan`, { method: 'POST' });
      const data = await res.json();
      setScanResult(data.results);
      // Refresh project data
      const projRes = await fetch(`/api/projects/${params.id}`);
      const projData = await projRes.json();
      setProject(projData.project);
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-red-400">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-slate-400 text-sm">{project.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Site
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          )}
          <button
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Performance</p>
              <p className="text-2xl font-bold">
                {project.health?.performance ?? scanResult?.performance ?? '--'}
                {(project.health?.performance || scanResult?.performance) && <span className="text-sm text-slate-400">/100</span>}
              </p>
            </div>
          </div>
          {scanResult?.responseTime && (
            <p className="text-xs text-slate-500">Response time: {scanResult.responseTime}ms</p>
          )}
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Security</p>
              <p className="text-2xl font-bold">
                {project.health?.security ?? scanResult?.security ?? '--'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Uptime</p>
              <p className="text-2xl font-bold">
                {project.health?.uptime ?? scanResult?.uptime ?? '--'}
              </p>
            </div>
          </div>
          {scanResult?.statusCode && (
            <p className="text-xs text-slate-500">HTTP {scanResult.statusCode}</p>
          )}
        </div>
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Issues */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Issues Found
            </h3>
            {scanResult.issues.length > 0 ? (
              <ul className="space-y-2">
                {scanResult.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-400 text-sm">No issues found!</p>
            )}
          </div>

          {/* Suggestions */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-400" />
              Suggestions
            </h3>
            {scanResult.suggestions.length > 0 ? (
              <ul className="space-y-2">
                {scanResult.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-teal-400 mt-0.5">→</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm">All good!</p>
            )}
          </div>
        </div>
      )}

      {/* Project Info */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Project Details</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-400">URL</dt>
            <dd className="text-white">{project.url || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Category</dt>
            <dd className="text-white capitalize">{project.category}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Status</dt>
            <dd>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                project.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {project.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">GitHub</dt>
            <dd className="text-white">{project.github_url || 'Not connected'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
