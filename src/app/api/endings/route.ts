import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const result = await sql`
      SELECT ending_id, unlocked_at
      FROM user_endings
      WHERE user_id = ${user.id}
      ORDER BY unlocked_at DESC
    `;

    const endings = result.rows.map(row => row.ending_id);

    return NextResponse.json({ endings });
  } catch (error) {
    console.error('Get endings error:', error);
    return NextResponse.json(
      { error: 'エンディングの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endingId } = body;

    if (!endingId) {
      return NextResponse.json(
        { error: 'エンディングIDは必須です' },
        { status: 400 }
      );
    }

    // 既に存在する場合はスキップ（UNIQUE制約でエラーになるのを防ぐ）
    const existing = await sql`
      SELECT id FROM user_endings
      WHERE user_id = ${user.id} AND ending_id = ${endingId}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    await sql`
      INSERT INTO user_endings (user_id, ending_id)
      VALUES (${user.id}, ${endingId})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save ending error:', error);
    return NextResponse.json(
      { error: 'エンディングの保存に失敗しました' },
      { status: 500 }
    );
  }
}
