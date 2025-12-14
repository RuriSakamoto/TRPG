import { sql } from '@vercel/postgres';

export { sql };

// ユーザー型定義
export interface User {
  id: number;
  email: string;
  display_name: string | null;
  created_at: Date;
  updated_at: Date;
}

// セッション型定義
export interface Session {
  id: number;
  user_id: number;
  session_token: string;
  expires_at: Date;
  created_at: Date;
}

// エンディング型定義
export interface UserEnding {
  id: number;
  user_id: number;
  ending_id: string;
  unlocked_at: Date;
}
