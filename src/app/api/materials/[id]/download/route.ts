import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Material } from '@/lib/models';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    const material = await db.collection<Material>('materials').findOne({ id });
    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    if (!material.supabasePath) {
      return NextResponse.json({ error: 'No Supabase Path found' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('materials')
      .createSignedUrl(material.supabasePath, 60 * 60); // 1 hour expiry

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    return NextResponse.json({ 
      url: data.signedUrl, 
      filename: material.originalName, 
      mimetype: material.mimetype 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

