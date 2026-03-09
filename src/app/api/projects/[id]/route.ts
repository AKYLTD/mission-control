import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject, getLatestHealthCheck } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = getProject(parseInt(params.id)) as any;
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Enrich with health data
    const perfCheck = getLatestHealthCheck(project.id, 'performance') as any;
    const secCheck = getLatestHealthCheck(project.id, 'security') as any;
    
    let uptimeStatus = null;
    if (perfCheck?.details) {
      try {
        const details = JSON.parse(perfCheck.details);
        uptimeStatus = details.statusCode >= 200 && details.statusCode < 400 ? '✅' : '❌';
      } catch (e) {}
    }
    
    const enriched = {
      ...project,
      health: {
        performance: perfCheck?.score || null,
        security: secCheck?.status === 'good' ? '✅' : secCheck?.status === 'warning' ? '⚠️' : secCheck ? '❌' : null,
        uptime: uptimeStatus,
      }
    };
    
    return NextResponse.json({ project: enriched });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get project' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    updateProject(parseInt(params.id), data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    deleteProject(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
