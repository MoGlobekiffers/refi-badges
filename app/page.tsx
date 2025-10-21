import TriggerBadge from "../components/TriggerBadge";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Test Badge</h1>
      <TriggerBadge habit="walk 30 min" user="Mo" target={7} />
    </main>
  );
}
