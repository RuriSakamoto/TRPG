import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User, Session } from './db';

const SESSION_COOKIE_NAME = 'trpg_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30日

// パスワードをハッシュ化
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// パスワードを検証
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ランダムなセッショントークンを生成
export function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ユーザーを作成
export async function createUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user?: User; error?: string }> {
  try {
    const passwordHash = await hashPassword(password);
    
    const result = await sql<User>`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${email}, ${passwordHash}, ${displayName || email})
      RETURNING id, email, display_name, created_at, updated_at
    `;

    if (result.rows.length === 0) {
      return { error: 'ユーザーの作成に失敗しました' };
    }

    return { user: result.rows[0] };
  } catch (error: any) {
    if (error.message?.includes('duplicate key')) {
      return { error: 'このメールアドレスは既に登録されています' };
    }
    console.error('Create user error:', error);
    return { error: 'ユーザーの作成に失敗しました' };
  }
}

// ユーザーを認証
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  try {
    const result = await sql`
      SELECT id, email, password_hash, display_name, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return { error: 'メールアドレスまたはパスワードが正しくありません' };
    }

    const user = result.rows[0] as User & { password_hash: string };
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return { error: 'メールアドレスまたはパスワードが正しくありません' };
    }

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  } catch (error) {
    console.error('Authenticate user error:', error);
    return { error: '認証に失敗しました' };
  }
}

// セッションを作成
export async function createSession(userId: number): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await sql`
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
  `;

  return sessionToken;
}

// セッションからユーザーを取得
export async function getUserFromSession(sessionToken: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT u.id, u.email, u.display_name, u.created_at, u.updated_at
      FROM users u
      INNER JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_token = ${sessionToken}
        AND s.expires_at > NOW()
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  } catch (error) {
    console.error('Get user from session error:', error);
    return null;
  }
}

// 現在のユーザーを取得
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  return getUserFromSession(sessionToken);
}

// セッションを削除
export async function deleteSession(sessionToken: string): Promise<void> {
  await sql`
    DELETE FROM user_sessions
    WHERE session_token = ${sessionToken}
  `;
}

// 期限切れセッションをクリーンアップ
export async function cleanupExpiredSessions(): Promise<void> {
  await sql`
    DELETE FROM user_sessions
    WHERE expires_at < NOW()
  `;
}

// セッションCookieを設定
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

// セッションCookieを削除
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
