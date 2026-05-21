import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials in environment variables');
      return NextResponse.json(
        { error: 'Konfigurasi server tidak lengkap' },
        { status: 500 }
      );
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { name, username, email, password, role } = body;

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Semua kolom harus diisi' },
        { status: 400 }
      );
    }

    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        username,
        role
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Gagal membuat pengguna' },
        { status: 500 }
      );
    }

    // 2. Insert into public.users
    const { error: dbError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      name,
      username,
      role
    });

    if (dbError) {
      // If DB insert fails, we should ideally rollback auth user creation
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: 'Gagal menyimpan profil pengguna: ' + dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Pengguna berhasil dibuat', user: authData.user },
      { status: 201 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', details: err.message },
      { status: 500 }
    );
  }
}
