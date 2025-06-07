// src/app/api/admin-users/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

// Define roles using the same ENUM values as in your database schema
const adminRoleEnum = z.enum(['SuperAdmin', 'KYCReviewer', 'ContentModerator', 'LogisticsManager', 'ReportsManager', 'SellerManager']);

const updateAdminUserSchema = z.object({
  full_name: z.string().optional(),
  role: adminRoleEnum.optional(),
  is_active: z.boolean().optional(),
  // Note: Password updates should be handled via a separate, more secure endpoint (e.g., /api/admin-users/[id]/change-password)
  // that might require current password or other verification.
});

// GET /api/admin-users/[id] - Get a single admin user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Implement proper authentication and authorization
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Admin user ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('AdminUser')
      .select('id, email, full_name, role, last_login_at, is_active, created_at, updated_at') // Exclude hashed_password
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ message: 'Admin user not found' }, { status: 404 });
      }
      console.error('Supabase error fetching admin user by ID:', error);
      return NextResponse.json({ message: 'Error fetching admin user', error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ message: 'Admin user not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error('Unexpected error fetching admin user by ID:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Unexpected error fetching admin user', error: errorMessage }, { status: 500 });
  }
}

// PUT /api/admin-users/[id] - Update an admin user by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Implement proper authentication and authorization
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Admin user ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validationResult = updateAdminUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validationResult.data;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No fields to update provided' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('AdminUser')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, role, is_active, updated_at') // Return updated user, exclude password
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Error could mean record to update not found
        return NextResponse.json({ message: 'Admin user not found or no changes made' }, { status: 404 });
      }
      console.error('Supabase error updating admin user:', error);
      return NextResponse.json({ message: 'Error updating admin user', error: error.message }, { status: 500 });
    }
    
    if (!data) { // Should be caught by error.code PGRST116 if not found, but good to double check
        return NextResponse.json({ message: 'Admin user not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error('Unexpected error updating admin user:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Unexpected error updating admin user', error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/admin-users/[id] - Delete an admin user by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Implement proper authentication and authorization (e.g., only SuperAdmin can delete)
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Admin user ID is required' }, { status: 400 });
  }

  try {
    const { error, count } = await supabase
      .from('AdminUser')
      .delete({ count: 'exact' }) // Ensure we know if a row was actually deleted
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting admin user:', error);
      return NextResponse.json({ message: 'Error deleting admin user', error: error.message }, { status: 500 });
    }

    if (count === 0) {
        return NextResponse.json({ message: 'Admin user not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Admin user deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (e) {
    console.error('Unexpected error deleting admin user:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Unexpected error deleting admin user', error: errorMessage }, { status: 500 });
  }
}
