import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const ALLOWED_DOMAINS = ['futminna.edu.ng', 'st.futminna.edu.ng'];

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    // Enforce institutional email domain
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!ALLOWED_DOMAINS.includes(emailDomain)) {
      return NextResponse.json(
        { error: 'Only Futminna Staff or Student email addresses are allowed to register' },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Supabase may require email confirmation depending on project settings.
    // If the user object exists but session is null, confirmation is pending.
    if (data.user && !data.session) {
      return NextResponse.json({
        success: true,
        requiresConfirmation: true,
        message: 'Account created! Please check your email to confirm your address before logging in.',
      });
    }

    return NextResponse.json({
      success: true,
      requiresConfirmation: false,
      message: 'Account created successfully! You can now log in.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
