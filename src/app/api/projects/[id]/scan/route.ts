import { NextRequest, NextResponse } from 'next/server';
import { getProject, saveHealthCheck, saveScanResult, updateProject } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const project = getProject(projectId) as any;
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const results: any = {
      performance: null,
      security: null,
      uptime: null,
      issues: [],
      suggestions: [],
    };

    // Check if URL is available for scanning
    if (project.url) {
      // Performance check (basic)
      try {
        const start = Date.now();
        const res = await fetch(project.url, { method: 'HEAD' });
        const responseTime = Date.now() - start;
        
        // Calculate simple performance score based on response time
        let perfScore = 100;
        if (responseTime > 500) perfScore = 85;
        if (responseTime > 1000) perfScore = 70;
        if (responseTime > 2000) perfScore = 50;
        if (responseTime > 3000) perfScore = 30;
        
        results.performance = perfScore;
        results.uptime = res.ok ? '✅' : '❌';
        
        saveHealthCheck({
          project_id: projectId,
          check_type: 'performance',
          status: perfScore >= 70 ? 'good' : perfScore >= 50 ? 'warning' : 'critical',
          score: perfScore,
          details: JSON.stringify({ responseTime, statusCode: res.status }),
        });

        // Check security headers
        const headers = res.headers;
        const securityIssues = [];
        
        if (!headers.get('strict-transport-security')) {
          securityIssues.push('Missing HSTS header');
          results.suggestions.push('Add Strict-Transport-Security header');
        }
        if (!headers.get('x-content-type-options')) {
          securityIssues.push('Missing X-Content-Type-Options');
          results.suggestions.push('Add X-Content-Type-Options: nosniff');
        }
        if (!headers.get('x-frame-options') && !headers.get('content-security-policy')) {
          securityIssues.push('Missing clickjacking protection');
          results.suggestions.push('Add X-Frame-Options or CSP frame-ancestors');
        }
        
        results.security = securityIssues.length === 0 ? '✅' : 
                          securityIssues.length <= 2 ? '⚠️' : '❌';
        results.issues = securityIssues;
        
        saveHealthCheck({
          project_id: projectId,
          check_type: 'security',
          status: securityIssues.length === 0 ? 'good' : 'warning',
          score: Math.max(0, 100 - securityIssues.length * 20),
          details: JSON.stringify({ issues: securityIssues }),
        });
        
      } catch (fetchError) {
        results.uptime = '❌';
        results.issues.push('Site unreachable');
        
        saveHealthCheck({
          project_id: projectId,
          check_type: 'uptime',
          status: 'critical',
          score: 0,
          details: 'Site unreachable',
        });
      }
    }

    // Save scan results
    saveScanResult({
      project_id: projectId,
      scan_type: 'full',
      issues: JSON.stringify(results.issues),
      suggestions: JSON.stringify(results.suggestions),
    });

    // Update project status based on results
    let newStatus = 'active';
    if (results.issues.length > 3 || results.uptime === '❌') {
      newStatus = 'error';
    } else if (results.issues.length > 0) {
      newStatus = 'warning';
    }
    
    updateProject(projectId, { status: newStatus });

    return NextResponse.json({ 
      success: true, 
      results,
      message: 'Scan completed'
    });
    
  } catch (error) {
    console.error('Scan failed:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
