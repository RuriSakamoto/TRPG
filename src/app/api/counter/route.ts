import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const result = await sql`
      SELECT count FROM game_start_counter WHERE id = 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: result.rows[0].count });
  } catch (error) {
    console.error('Get counter error:', error);
    return NextResponse.json(
      { error: 'カウンターの取得に失敗しました' },
      { status: 500 }
    );
  }
}
