import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject, getLatestHealthCheck } from '@/lib/db';

export async function GET() {
  try {
    const projects = getAllProjects();
    
    // Enrich with health data
    const enriched = projects.map((project: any) => {
      const perfCheck = getLatestHealthCheck(project.id, 'performance') as any;
      const secCheck = getLatestHealthCheck(project.id, 'security') as any;
      
      // Check uptime from performance check (it includes response status)
      let uptimeStatus = null;
      if (perfCheck?.details) {
        try {
          const details = JSON.parse(perfCheck.details);
          uptimeStatus = details.statusCode >= 200 && details.statusCode < 400 ? '✅' : '❌';
        } catch (e) {}
      }
      
      return {
        ...project,
        health: {
          performance: perfCheck?.score || null,
          security: secCheck?.status === 'good' ? '✅' : secCheck?.status === 'warning' ? '⚠️' : secCheck ? '❌' : null,
          uptime: uptimeStatus,
        }
      };
    });
    
    return NextResponse.json({ projects: enriched });
  } catch (error) {
    console.error('Failed to get projects:', error);
    return NextResponse.json({ error: 'Failed to get projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const id = createProject({
      name: data.name,
      description: data.description,
      url: data.url,
      github_url: data.github_url,
      category: data.category,
    });
    
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
