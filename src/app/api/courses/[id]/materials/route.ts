import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Material } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    const { db } = await connectToDatabase();
    
    const materials = await db.collection<Material>('materials').find({ courseId }).toArray();
    
    return NextResponse.json(materials.map(m => ({ ...m, _id: undefined })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    const body = await req.json();
    const { supabasePath, title, description, filename, originalName, mimetype, size, uploadedBy } = body;

    if (!supabasePath) {
      return NextResponse.json({ error: 'Missing Supabase path' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const material: Material = {
      id: uuidv4(),
      courseId,
      title: title || originalName,
      description: description || '',
      filename,
      originalName,
      mimetype,
      size,
      supabasePath,
      uploadedBy: uploadedBy || 'Anonymous',
      uploadedAt: new Date().toISOString()
    };

    await db.collection<Material>('materials').insertOne(material);

    return NextResponse.json({ ...material, _id: undefined }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
