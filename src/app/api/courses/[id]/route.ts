import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course, Material } from '@/lib/models';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    const course = await db.collection<Course>('courses').findOne({ id });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const materials = await db.collection<Material>('materials').find({ courseId: id }).toArray();
    
    return NextResponse.json({ 
      ...course, 
      _id: undefined,
      materials: materials.map(m => ({ ...m, _id: undefined }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { db } = await connectToDatabase();
    
    const result = await db.collection<Course>('courses').findOneAndUpdate(
      { id },
      { $set: { ...body, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ ...result, _id: undefined });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    const materials = await db.collection<Material>('materials').find({ courseId: id }).toArray();
    
    const pathsToDelete = materials.map(m => m.supabasePath).filter(Boolean) as string[];
    if (pathsToDelete.length > 0) {
      const { error } = await supabaseAdmin.storage.from('materials').remove(pathsToDelete);
      if (error) console.error('Failed to delete Supabase files:', error);
    }

    await db.collection<Course>('courses').deleteOne({ id });
    await db.collection<Material>('materials').deleteMany({ courseId: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
