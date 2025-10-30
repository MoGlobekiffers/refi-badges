export const metadata = {
  title: "ReFi Badges — Share your weekly climate habits",
  description:
    "Set a weekly goal, check off your days, unlock a shareable badge, and publish it to your public gallery.",
  openGraph: {
    title: "ReFi Badges — Share your weekly climate habits",
    description:
      "Set a weekly goal, check off your days, unlock a shareable badge, and publish it to your public gallery.",
    images: [{ url: "/api/og/badge?gallery=1" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <section className="rounded-2xl border p-8 md:p-12 mb-10 bg-white/60">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          ReFi Badges
        </h1>
        <p className="mt-4 text-lg opacity-80">
          Turn everyday pro-climate habits into weekly, shareable badges.
          Set a goal (e.g., 3/7), check your days, unlock an image, and share your public gallery.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/badges" className="px-4 py-2 rounded-xl border font-medium hover:bg-black/5">
            Explore public badges
          </a>
          <a href="/u/test" className="px-4 py-2 rounded-xl border font-medium hover:bg-black/5">
            View sample profile (@test)
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-6">
          <h3 className="font-semibold mb-2">Simple weekly goal</h3>
          <p className="opacity-80 text-sm">
            Pick one habit and a weekly target. Keep it lightweight and consistent.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="font-semibold mb-2">Unlock a shareable badge</h3>
          <p className="opacity-80 text-sm">
            When you hit the target, you get a generated image ready to share.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="font-semibold mb-2">Public pages</h3>
          <p className="opacity-80 text-sm">
            Profiles and badges are public: <code>/u/&lbrace;handle&rbrace;</code>,{" "}
            <code>/badge/&lbrace;id&rbrace;</code>, and <code>/badges</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
