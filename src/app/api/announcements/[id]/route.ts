import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Announcement } from '@/lib/models';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    await db.collection<Announcement>('announcements').deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
