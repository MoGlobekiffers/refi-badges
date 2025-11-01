// utils/habits.ts
export type HabitOption = {
  value: string;
  label: string;      // affiché dans le menu
  celo?: boolean;     // aligné avec l’écosystème Celo
  proof?: 'recommended' | 'celo' | 'none'; // info pour l’UI (icônes)
};

export const HABITS: HabitOption[] = [
  // Wellness / generic
  { value: 'read_10_pages', label: 'Read 10 pages', proof: 'recommended' },
  { value: 'walk_10_min', label: 'Walk 10 minutes', proof: 'recommended' },
  { value: 'hydrate', label: 'Drink a big bottle of water', proof: 'recommended' },

  // ReFi / Climate-friendly (Celo-aligned where relevant)
  { value: 'eco_transport', label: 'Use eco transport (walk/bike/carpool) instead of a car', proof: 'recommended' },
  { value: 'recycle_weekly', label: 'Recycle or sort waste at least X times this week', proof: 'recommended' },
  { value: 'cleanup_action', label: 'Join a local cleanup (beach/park/neighborhood)', proof: 'recommended' },
  { value: 'home_energy', label: 'Reduce home energy use (lights off, limit AC/heating)', proof: 'recommended' },
  { value: 'local_food', label: 'Eat local/seasonal food', proof: 'recommended' },
  { value: 'plant_care', label: 'Plant a tree or take care of an existing one', celo: true, proof: 'celo' },
  { value: 'share_action', label: 'Share an eco-action to inspire others (post/social)', proof: 'recommended' },
  { value: 'carbon_credits', label: 'Buy or offset carbon credits (partner platforms)', celo: true, proof: 'celo' },
];

