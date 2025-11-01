export type HabitItem = {
  id: string;
  label: string;
  proof?: boolean; // pièce jointe recommandée
  celo?: boolean;  // en adéquation ReFi/Celo
};

export const HABITS: HabitItem[] = [
  { id: 'walk 10 mn', label: 'Marcher 10 min' },
  { id: 'read 10 pages', label: 'Lire 10 pages' },
  { id: 'hydrate', label: 'Boire 1 grande bouteille d’eau' },
  { id: 'meditate 5', label: 'Méditer 5 minutes' },

  { id: 'eco-transport', label: 'Prendre un transport écologique (vélo, marche, covoit.)', proof: true, celo: true },
  { id: 'waste-recycle', label: 'Recycler / trier ses déchets (≥ X fois / semaine)', proof: true, celo: true },
  { id: 'cleanup-action', label: 'Participer à un nettoyage (plage, parc, quartier)', proof: true, celo: true },
  { id: 'reduce-energy', label: 'Réduire sa conso d’énergie (lumières, chauffage/clim, etc.)', proof: true, celo: true },
  { id: 'local-food', label: 'Utiliser des produits locaux/de saison (alimentation)', proof: true, celo: true },
  { id: 'tree-care', label: 'Planter/arroser/prendre soin de plantations existantes', proof: true, celo: true },
  { id: 'raise-awareness', label: 'Sensibiliser une personne / publier une action éco-responsable', proof: true, celo: true },
  { id: 'carbon-offset', label: 'Acheter/Compenser des crédits carbone (plateforme partenaire)', proof: true, celo: true },
];

