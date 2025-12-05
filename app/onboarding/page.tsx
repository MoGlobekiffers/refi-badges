'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HABITS } from '@/utils/habits';
import { createClient } from '@/utils/supabase/client';
import SignOutButton from '@/app/components/SignOutButton';

type Profile = {
  id: string;
  handle: string | null;
  habit: string | null;
  target: number | null;
};

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [handle, setHandle] = useState<string>('');
  const [habit, setHabit] = useState<string>('');
  const [target, setTarget] = useState<number>(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          router.replace('/login');
          return;
        }

        const { data: prof, error } = await supabase
          .from('profiles')
          .select('id, handle, habit, target')
          .eq('id', auth.user.id)
          .single();

        if (error) throw error;

        const p = prof as Profile;
        setProfileId(p.id);
        setHandle(p.handle ?? '');
        setHabit(p.habit ?? (HABITS[0]?.value ?? ''));
        setTarget(p.target ?? 1);
      } catch (e) {
        console.error(e);
        setMessage({ type: 'error', text: 'Error loading profile' });
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const saveProfile = async () => {
    try {
      if (!profileId) return;
      setSaving(true);
      setMessage(null);

      const { error } = await supabase.from('profiles').update({
        handle: handle || null,
        habit: habit || null,
        target: target || 1,
      }).eq('id', profileId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile saved successfully ✅' });
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      router.push('/app'); // Auto-redirect after save for better UX
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-neutral-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 animate-spin border-t-2 border-emerald-600"></div>
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">

      {/* Left: Branding & Vision */}
      <div className="md:w-1/3 bg-emerald-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-800/50 to-emerald-950/80 z-0"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-emerald-900 font-bold">R</div>
            <span className="text-xl font-bold tracking-tight">ReFi Badges</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Design your<br />Proof of Habit.
          </h1>
          <p className="text-emerald-100/80 leading-relaxed">
            Choose a habit that matters. Commit to a weekly target.
            We verify your consistency on-chain using Celo.
          </p>
        </div>

        <div className="relative z-10 mt-12">
          <div className="flex items-center gap-3 text-sm text-emerald-200/60 mb-8">
            <SignOutButton />
          </div>
          <p className="text-xs text-emerald-600">Step 1 of 1</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="md:w-2/3 bg-white p-8 md:p-16 overflow-y-auto">
        <div className="max-w-xl mx-auto">

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Configure Profile</h2>
            <p className="text-neutral-500">Set up your public identity and choose your challenge.</p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 ${message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              <span>{message.type === 'success' ? '🎉' : '⚠️'}</span>
              {message.text}
            </div>
          )}

          <div className="space-y-8">

            {/* Handle Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Public Name (Handle)
              </label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                placeholder="e.g. ClimateWarrior"
              />
              <p className="text-xs text-gray-400 mt-2 ml-1">Visible on your badge & leaderboards.</p>
            </div>

            {/* Habit Selection */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Select your Quest
              </label>
              <div className="relative">
                <select
                  value={habit}
                  onChange={(e) => setHabit(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-neutral-800"
                >
                  {HABITS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label} {h.celo ? '(✨ Celo Aligned)' : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Target Slider */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <label className="text-sm font-semibold text-neutral-800">
                  Weekly Target
                </label>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-bold font-mono">
                  {target} days / week
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={7}
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value || '1', 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-3 font-medium">
                <span>Casual (1)</span>
                <span>Daily Habit (7)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col items-center gap-4">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="w-full py-4 rounded-xl bg-neutral-900 text-white font-bold text-lg hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-neutral-200"
              >
                {saving ? 'Creating Profile...' : 'Start My Journey ->'}
              </button>

              {profileId && (
                <button onClick={() => router.push('/app')} className="text-sm text-neutral-400 hover:text-neutral-600 underline">
                  Skip changes & go to dashboard
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

