import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  // Test MongoDB connection
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    health.mongoConnected = true;
  } catch (err: any) {
    health.mongoConnected = false;
    health.mongoError = err.message;
  }

  // Test Supabase connectivity
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;
    health.supabaseConnected = true;
    health.buckets = data?.length || 0;
  } catch (err: any) {
    health.supabaseConnected = false;
    health.supabaseError = err.message;
  }

  return NextResponse.json(health);
}
