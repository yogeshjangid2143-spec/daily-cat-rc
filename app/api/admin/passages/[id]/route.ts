import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    let isAuthorized = false;

    if (token && adminEmail) {
       const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
       const { data: { user } } = await supabaseAdmin.auth.getUser(token);
       if (user && user.email?.toLowerCase() === adminEmail.toLowerCase()) {
         isAuthorized = true;
       }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) return NextResponse.json({ error: 'Missing passage ID' }, { status: 400 });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await supabaseAdmin.from('passages').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete passage error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    let isAuthorized = false;

    if (token && adminEmail) {
       const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
       const { data: { user } } = await supabaseAdmin.auth.getUser(token);
       if (user && user.email?.toLowerCase() === adminEmail.toLowerCase()) {
         isAuthorized = true;
       }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { published_date } = body;

    if (!id || !published_date) {
      return NextResponse.json({ error: 'Missing passage ID or published_date' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await supabaseAdmin
      .from('passages')
      .update({ published_date })
      .eq('id', id);

    if (error) {
        if (error.code === '23505') { // Postgres unique violation error code
            return NextResponse.json({ error: 'A passage is already scheduled for this date. Please choose another date.' }, { status: 400 });
        }
        throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update passage error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
