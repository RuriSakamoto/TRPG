'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import AuthModal from './AuthModal';

export default function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return <div className="text-slate-400">読み込み中...</div>;
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          ログイン
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors border border-slate-600"
      >
        <User size={20} className="text-slate-300" />
        <span className="text-sm text-slate-200">{user.displayName || user.email}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg border border-slate-600 py-1 z-50">
            <div className="px-4 py-2 border-b border-slate-700">
              <p className="text-xs text-slate-400">ログイン中</p>
              <p className="text-sm text-slate-200 truncate">{user.email}</p>
            </div>
            <button
              onClick={async () => {
                await signOut();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300"
            >
              <LogOut size={16} />
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  );
}
