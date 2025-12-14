import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // カウンターをインクリメント
    const result = await sql`
      UPDATE game_start_counter 
      SET count = count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING count
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'カウンターの更新に失敗しました' },
        { status: 500 }
      );
    }

    const newCount = result.rows[0].count;

    // ログを記録（オプション）
    try {
      const user = await getCurrentUser();
      const cookieStore = await cookies();
      const sessionId = cookieStore.get('trpg_session')?.value || 'anonymous';

      await sql`
        INSERT INTO game_start_logs (user_id, session_id)
        VALUES (${user?.id || null}, ${sessionId})
      `;
    } catch (logError) {
      console.error('Failed to log game start:', logError);
      // ログ記録失敗してもカウントは成功として扱う
    }

    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('Increment counter error:', error);
    return NextResponse.json(
      { error: 'カウンターの更新に失敗しました' },
      { status: 500 }
    );
  }
}
