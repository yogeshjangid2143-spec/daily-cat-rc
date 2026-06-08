import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(req: Request) {
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

    // Since this is just fetching metadata for admin view, we enforce auth
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: passages, error } = await supabaseAdmin
      .from('passages')
      .select('id, title, difficulty, topic, published_date, created_at')
      .order('published_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: passages });
  } catch (error: any) {
    console.error('Fetch passages error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
