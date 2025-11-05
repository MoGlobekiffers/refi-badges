'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

const HABITS = [
  'Walk 10 min',
  'Meditate 5 min',
  'Stretch 5 min',
  'Drink 1L of water',
  'Read 5 pages',
  'Journal 5 min',
  'Cold shower',
  'No sugar for a day',
  'Sleep before 23:00',
  'Gratitude: 3 things',
  'Learn 10 words',
  'Practice a language',
  'Do 10 push-ups',
  'No social media evening',
  'Tidy up 10 min',
];

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function OnboardingPage() {
  const router = useRouter();

  const [handle, setHandle] = useState('');
  const [habit, setHabit] = useState<string>(HABITS[0]);
  const [target, setTarget] = useState<number>(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        // 1) Logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('[Onboarding] user load error:', userError);
          router.push('/login');
          return;
        }

        // 2) Existing profile
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select('id, handle, habit, target')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('[Onboarding] profile load error:', profileError);
          alert(`Error while loading your profile: ${profileError.message}`);
          return;
        }

        if (profileData) {
          setHandle(profileData.handle ?? '');
          if (profileData.habit && HABITS.includes(profileData.habit)) {
            setHabit(profileData.habit);
          }
          if (profileData.target && profileData.target >= 1 && profileData.target <= 7) {
            setTarget(profileData.target);
          }
        }
      } catch (e: any) {
        console.error('[Onboarding] loadProfile unexpected error:', e);
        alert(`Unexpected error while loading your profile: ${e?.message ?? e}`);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1) User
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error('You are not logged in.');
      }

      // 2) Upsert profile
      const {
        data: profile,
        error: upsertError,
      } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            handle: handle.trim() || null,
            habit,
            target,
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single();

      if (upsertError) {
        console.error('[Onboarding] profile upsert error:', upsertError);
        throw upsertError;
      }

      // 3) Reset ONLY this week’s progress
      const today = new Date();
      const weekStart = getWeekStart(today);

      const { error: deleteError } = await supabase
        .from('progress')
        .delete()
        .eq('profile_id', profile.id)
        .eq('week_start', weekStart);

      if (deleteError) {
        console.error('[Onboarding] progress reset error:', deleteError);
        throw deleteError;
      }

      alert('Profile saved and this week has been reset ✅');
    } catch (e: any) {
      alert(`Error while saving your profile: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/app');
  };

  const handleSignOut = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Onboarding] sign-out error:', error);
        throw error;
      }
      router.push('/login');
    } catch (e: any) {
      alert(`Sign-out error: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 bg-gray-50">
      {/* Top-right Sign out */}
      <div className="w-full max-w-2xl flex justify-end mb-4">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={saving}
          className="px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold bg-white hover:bg-gray-100 disabled:opacity-60"
        >
          {saving ? 'Please wait…' : 'Sign out'}
        </button>
      </div>

      <section className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Onboarding</h1>

        <div className="space-y-6">
          {/* Handle */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Public name (handle)
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ex: mo"
            />
          </div>

          {/* Habit / challenge */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Habit / challenge
            </label>
            <select
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {HABITS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Weekly goal */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Weekly goal (1–7)
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-black text-white rounded-full py-3 font-semibold hover:bg-gray-900 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>

            <button
              type="button"
              onClick={handleGoToDashboard}
              className="flex-1 border border-gray-300 bg-white rounded-full py-3 font-semibold hover:bg-gray-100"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

