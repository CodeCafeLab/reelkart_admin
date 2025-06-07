
// src/app/api/admin-users/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { createAdminUserSchema } from '@/types/admin-user';

// GET /api/admin-users - List all admin users
export async function GET(request: NextRequest) {
  // TODO: Implement proper authentication and authorization (e.g., check if the requester is an authenticated SuperAdmin)
  console.log("Attempting to list admin users. TODO: Add auth checks.");

  try {
    const { data, error } = await supabase
      .from('AdminUser')
      .select('id, email, full_name, role, last_login_at, is_active, created_at, updated_at') // Exclude hashed_password
      .order('created_at', { ascending: false });


    if (error) {
      console.error('Supabase error fetching admin users:', error);
      return NextResponse.json({ message: 'Error fetching admin users', error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error('Unexpected error fetching admin users:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Unexpected error fetching admin users', error: errorMessage }, { status: 500 });
  }
}

// POST /api/admin-users - Create a new admin user
export async function POST(request: NextRequest) {
  // TODO: Implement proper authentication and authorization (e.g., check if the requester is an authenticated SuperAdmin)
  console.log("Attempting to create admin user. TODO: Add auth checks.");

  try {
    const body = await request.json();
    const validationResult = createAdminUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, full_name, role, is_active } = validationResult.data;

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('AdminUser')
      .select('email')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows found, which is fine here
        console.error('Supabase error checking existing user:', fetchError);
        return NextResponse.json({ message: 'Error checking for existing user', error: fetchError.message }, { status: 500 });
    }
    if (existingUser) {
      return NextResponse.json({ message: 'Admin user with this email already exists' }, { status: 409 }); // 409 Conflict
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data: newUser, error: insertError } = await supabase
      .from('AdminUser')
      .insert([
        {
          email,
          hashed_password: hashedPassword,
          full_name,
          role,
          is_active,
        },
      ])
      .select('id, email, full_name, role, is_active, created_at') // Return the created user (without password)
      .single();

    if (insertError) {
      console.error('Supabase error creating admin user:', insertError);
      return NextResponse.json({ message: 'Error creating admin user', error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (e) {
    console.error('Unexpected error creating admin user:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Unexpected error creating admin user', error: errorMessage }, { status: 500 });
  }
}
