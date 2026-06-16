import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all courses
    const courses = await db.collection<Course>('courses').find({}).toArray();
    
    // Get material counts per course
    const materialCounts = await db.collection('materials').aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 } } }
    ]).toArray();

    const countMap = materialCounts.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const enrichedCourses = courses.map(c => ({
      ...c,
      _id: undefined, // Don't expose internal ObjectId
      materialCount: countMap[c.id] || 0
    }));

    return NextResponse.json(enrichedCourses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, instructor, category, color } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const course: Course = {
      id: uuidv4(),
      title,
      description: description || '',
      instructor: instructor || 'Unknown',
      category: category || 'General',
      color: color || '#6366f1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection<Course>('courses').insertOne(course);
    
    return NextResponse.json({ ...course, _id: undefined }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
