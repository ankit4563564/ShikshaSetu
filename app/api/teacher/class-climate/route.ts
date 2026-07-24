import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/routeGuard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(['teacher', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const searchParams = request.nextUrl.searchParams;
    const teacherId = auth.roleId;
    const days = parseInt(searchParams.get('days') || '7');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Missing teacherId' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: climateData, error } = await supabase
      .from('class_climate')
      .select('*')
      .eq('class_id', teacherId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('[Class Climate] Failed to fetch data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch class climate data' },
        { status: 500 }
      );
    }

    return NextResponse.json(climateData || []);
  } catch (error: any) {
    console.error('[Class Climate] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch class climate data' },
      { status: 500 }
    );
  }
}
