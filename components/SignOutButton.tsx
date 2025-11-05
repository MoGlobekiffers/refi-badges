'use client';

import { useState } from 'react';

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);

  const onSignOut = async () => {
    try {
      setLoading(true);
      const res = await fetch('/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      window.location.href = '/';
    } catch (e) {
      alert(`Sign-out error: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onSignOut}
      className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-900"
      aria-label="Sign out"
      title="Sign out"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}

