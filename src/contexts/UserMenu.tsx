'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import AuthModal from './AuthModal';

export default function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="text-slate-400 text-xs sm:text-sm px-2 sm:px-0">
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm sm:text-base font-medium"
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
        className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors border border-slate-600"
        aria-label="ユーザーメニュー"
      >
        <User size={16} className="text-slate-300 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm text-slate-200 max-w-[100px] sm:max-w-[150px] truncate">
          {user.displayName || user.email}
        </span>
        <Menu size={14} className="text-slate-400 sm:w-4 sm:h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-slate-800 rounded-md shadow-lg border border-slate-600 py-1 z-50">
            <div className="px-3 sm:px-4 py-2 border-b border-slate-700">
              <p className="text-xs text-slate-400">ログイン中</p>
              <p className="text-xs sm:text-sm text-slate-200 truncate mt-0.5">
                {user.email}
              </p>
              {user.displayName && (
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {user.displayName}
                </p>
              )}
            </div>
            <button
              onClick={async () => {
                await signOut();
                setShowMenu(false);
              }}
              className="w-full px-3 sm:px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300 text-sm transition-colors"
            >
              <LogOut size={16} />
              <span>ログアウト</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
