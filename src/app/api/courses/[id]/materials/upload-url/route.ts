import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const supabasePath = `${uuidv4()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { data, error } = await supabaseAdmin.storage
      .from('materials')
      .createSignedUploadUrl(supabasePath);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return NextResponse.json({ 
      signedUrl: data.signedUrl, 
      token: data.token,
      path: data.path,
      supabasePath: data.path 
    });
  } catch (error: any) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

