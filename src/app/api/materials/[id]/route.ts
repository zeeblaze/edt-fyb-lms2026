import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Material } from '@/lib/models';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    const material = await db.collection<Material>('materials').findOne({ id });
    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    if (material.supabasePath) {
      const { error } = await supabaseAdmin.storage.from('materials').remove([material.supabasePath]);
      if (error) {
        console.error('Failed to delete Supabase file:', error);
      }
    }

    await db.collection<Material>('materials').deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

