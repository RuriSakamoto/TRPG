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
    return <div className="text-gray-500">読み込み中...</div>;
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        <User size={20} className="text-gray-700" />
        <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-xs text-gray-500">ログイン中</p>
              <p className="text-sm text-gray-700 truncate">{user.email}</p>
            </div>
            <button
              onClick={async () => {
                await signOut();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
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
