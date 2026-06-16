import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course, Material } from '@/lib/models';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const coursesCount = await db.collection<Course>('courses').countDocuments();
    
    // Aggregate total size of all materials
    const materialsSizeResult = await db.collection<Material>('materials').aggregate([
      { $group: { _id: null, totalSize: { $sum: "$size" }, count: { $sum: 1 } } }
    ]).toArray();

    const totalSize = materialsSizeResult.length > 0 ? materialsSizeResult[0].totalSize : 0;
    const totalMaterials = materialsSizeResult.length > 0 ? materialsSizeResult[0].count : 0;

    // Get 5 most recent materials
    const recentMaterials = await db.collection<Material>('materials')
      .find({})
      .sort({ uploadedAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      totalCourses: coursesCount,
      totalMaterials,
      totalSize,
      recentMaterials: recentMaterials.map(m => ({ ...m, _id: undefined }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
