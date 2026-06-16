import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Announcement } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const announcements = await db.collection<Announcement>('announcements')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(announcements.map(a => ({ ...a, _id: undefined })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: annBody } = body;
    
    if (!title || !annBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const announcement: Announcement = {
      id: uuidv4(),
      title,
      body: annBody,
      createdAt: new Date().toISOString()
    };

    await db.collection<Announcement>('announcements').insertOne(announcement);
    
    return NextResponse.json({ ...announcement, _id: undefined }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
