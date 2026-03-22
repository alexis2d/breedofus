# Dofus Mount Manager - Plan Architectural

## 1. Aperçu du Projet

Application web Next.js pour la gestion d'élevage de montures Dofus (version 3.5+).

### Fonctionnalités Principales
1. **Calculateur de génération** - Déterminer les croisements possibles pour obtenir une monture cible
2. **Calculateur de temps de montée de jauge** - Estimer le temps pour passer de 0 à 20,000 d'une jauge (ou -5000 à 5000 pour la sérénité)
3. **Calculateur d'XP** - Estimer le temps pour monter une monture au niveau cible
4. **Planificateur de fécondité** - Calculer le chemin le plus rapide vers la fécondité

---

## 2. Modèles de Données

### 2.1 Monture (Mount)
```typescript
interface Mount {
  id: string;
  name: string;
  type: MountType; // 'dragodine' | 'muldo' | 'volkorne'
  gender: 'male' | 'female';
  generation: number;
  level: number;
  genealogy: Genealogy;
  capacities: Capacity[]; // 'sage' = 2x XP
  
  // Jauges
  stats: {
    maturity: number;      // 0-20,000
    endurance: number;     // 0-20,000
    love: number;          // 0-20,000
    experience: number;
    serenity: number;      // -5,000 to +5,000
  };
  
  // État
  isFertile: boolean;     // did not give birth yet; maturity < 20,000 || endurance < 20,000 || love < 20,000 
  isFecond: boolean;       // maturity >= 20,000 && endurance >= 20,000 && love >= 20,000
}

// XP requis par niveau
const XP_PER_LEVEL = {
  100: 172668,
  200: 867582
};
```

### 2.2 Jauges d'Enclos (Enclosure Gauges)
```typescript
interface EnclosureGauge {
  type: 'serenity' | 'endurance' | 'maturity' | 'love' | 'experience';
  value: number;           // 0-100,000
  tier: 1 | 2 | 3 | 4;
  fuelType: 'extrait' | 'philtre' | 'potion' | 'elixr';
  fuelSize: 'minuscule' | 'petit' | 'normal' | 'grand' | 'gigantesque';
}
```

### 2.3 Carburant (Fuel)
```typescript
interface Fuel {
  type: 'extrait' | 'philtre' | 'potion' | 'elixr';
  size: 'minuscule' | 'petit' | 'normal' | 'grand' | 'gigantesque';
  durability: number;      // 1000-5000
  tier: 1 | 2 | 3 | 4;
}
```

### 2.4 Généalogie
```typescript
interface Genealogy {
  parents: [Mount | null, Mount | null];  // père, mère
  grandparents: [Mount, Mount, Mount, Mount] | null;
}
```

---

## 3. Mécaniques de Jeu

### 3.1 Jauges d'Enclos
| Jauge | Couleur | Effet |
|-------|---------|-------|
| Baffeur/Caresseur | Violet | Sérénité (-/+) |
| Foudroyeur | Jaune | Endurance |
| Abreuvoir | Bleu | Maturité |
| Dragofesse | Rouge | Amour |
| Mangeoire | Beige | Expérience |

### 3.2 Tiers de Jauge
| Tier | Plage | Consommation | Gain Monture |
|------|-------|--------------|---------------|
| 1 | 0-40,000 | 10 | 10 |
| 2 | 40,001-70,000 | 20 | 20 |
| 3 | 70,001-90,000 | 30 | 30 |
| 4 | 90,001-100,000 | 40 | 40 |

### 3.3 Temps de Vidage
- Tier 1: 11h 6min
- Tier 2: 4h 9min
- Tier 3: 1h 51min
- Tier 4: 42min
- **Total: 17h 48min**

### 3.4 Conditions de Fécondité
Pour rendre une monture féconde:
- **Maturité** = 20,000
- **Endurance** = 20,000
- **Amour** = 20,000

### 3.5 Intervalles de Sérénité
| Sérénité | Jauges possibles |
|----------|------------------|
| -5,000 à -1 | Endurance |
| -2,000 à 2,000 | Maturité + Endurance ou Maturité + Amour |
| 0 à 5,000 | Amour |

---

## 4. Architecture des Composants

### 4.1 Structure des Pages
```
app/
├── page.tsx              # Page d'accueil / Dashboard
├── generation/
│   └── page.tsx         # Calculateur de génération
├── timers/
│   └── page.tsx         # Calculateur de temps d'amour
└── fertility/
    └── page.tsx         # Planificateur de fécondité
```

### 4.2 Composants UI
```
components/
├── layout/
│   ├── Header.tsx       # Navigation principale
│   └── Sidebar.tsx      # Menu latéral
├── mount/
│   ├── MountCard.tsx    # Carte de monture
│   ├── MountForm.tsx    # Formulaire de création
│   └── MountStats.tsx  # Affichage des stats
├── gauges/
│   ├── GaugeDisplay.tsx    # Affichage jauge
│   ├── GaugeControl.tsx    # Contrôle jauge
│   └── FuelSelector.tsx    # Sélecteur carburant
├── calculator/
│   ├── GenerationCalculator.tsx
│   ├── LoveTimeCalculator.tsx
│   └── FertilityPathfinder.tsx
└── ui/                  # Composants shadcn
```

### 4.3 State Management (Zustand)
```typescript
// stores/mountStore.ts
interface MountStore {
  mounts: Mount[];
  enclosures: Enclosure[];
  
  // Actions
  addMount: (mount: Mount) => void;
  updateMount: (id: string, updates: Partial<Mount>) => void;
  deleteMount: (id: string) => void;
  setEnclosureGauge: (enclosureId: string, gauge: EnclosureGauge) => void;
}

// stores/calculatorStore.ts
interface CalculatorStore {
  // Calculateur de génération
  selectedParents: [Mount | null, Mount | null];
  setParents: (parents: [Mount | null, Mount | null]) => void;
  
  // Calculateur de temps
  targetGauge: 'love' | 'maturity' | 'endurance';
  fuelType: Fuel['type'];
  fuelSize: Fuel['size'];
  
  // Pathfinder
  startStats: MountStats;
  calculateOptimalPath: () => FertilityStep[];
}
```

---

## 5. Fonctionnalités Détaillées

### 5.1 Calculateur de Génération

**Concepts Clés:**
- **Génération Cible**: La génération la plus haute obtainable avec un croisement
- **Chance de base**: 30% pour la génération cible
- **Bonus de niveau**: 0.15% par niveau (somme des deux parents)
- **Optimakina**: +10% à la chance de génération cible
- **Maximum théorique**: 100% (2 parents niveau 200 + Optimakina)

#### Makinas
Il existe 3 types de Makinas:
- **Animakina**: Capacité aléatoire sur le bébé
- **Kromakina**: Capacité Caméléone (100% de chance)
- **Optimakina**: +10% génération cible

Chaque makina a une déclinaison par type et génération.
La génération de la makina doit être >= génération cible.

#### Capacités Spéciales
| Capacité | Obtention | Effet |
|----------|-----------|-------|
| Amoureuse | Animakina (27%) | Gain amour ×2 |
| Endurante | Animakina (27%) | Gain endurance ×2 |
| Précoce | Animakina (27%) | Gain maturité ×2 |
| Sage | Animakina (14%) | Gain XP ×2 |
| Reproducteur | Animakina (5%) | +1 bébé |
| Caméléone | Kromakina (100%) | Change couleurs |

**Input:**
- Type de monture cible
- Montures disponibles (avec généalogie)
- Niveau des parents
- Optionnel: Optimakina

**Output:**
- Liste des croisements possibles
- Génération cible pour chaque croisement
- Probabilités détaillées (base + bonus niveau + optimakina)
- Arbre généalogique visuel

**Formule:**
```
ChanceGénérationCible = 30% + (NiveauPère + NiveauMère) × 0.15% + (Optimakina ? 10% : 0%)
ChanceParMonture = ChanceGénérationCible / NbCroisementsPossibles
```

**Logique:**
1. Rechercher tous les croisements possibles
2. Déterminer la génération cible pour chaque croisement
3. Calculer les probabilités basées sur:
   - Généalogie (parents vs grands-parents)
   - Niveau des parents
   - Présence de la monture dans l'arbre (multiple exemplaires = plus de chance)
4. Afficher les résultats triés par probabilité

### 5.2 Calculateur de Temps d'Amour

**Input:**
- Jauge actuelle (ex: 0 amour)
- Jauge cible (ex: 20,000 amour)
- Type de carburant
- Taille de carburant
- Nombre de montures dans l'enclos

**Output:**
- Temps total nécessaire
- Quantité de carburant requise
- Coût estimé (si prix carburants connu)

**Formule:**
```
Temps = (Cible - Actuel) / GainParTour × 10 secondes
GainParTour = Tier × NbMontures
```

### 5.3 Calculateur d'XP

**Input:**
- Niveau actuel
- Niveau cible (100 ou 200)
- Tier de jauge (1-4)
- Capacité "Sage" (multiplie l'XP par 2)
- Nombre de montures dans l'enclos

**Output:**
- XP total nécessaire
- Temps estimé
- Carburant requis

**XP par niveau:**
- Niveau 100: 172,668 XP
- Niveau 200: 867,582 XP

**XP par seconde:**
- Tier 1: 1 XP/s
- Tier 2: 2 XP/s
- Tier 3: 3 XP/s
- Tier 4: 4 XP/s
- Avec Sage: ×2

**Temps approximatifs (Tier 4):**
- Niveau 100: ~12 heures
- Niveau 200: ~60 heures 24 minutes

### 5.4 Planificateur de Fécondité

**Input:**
- Stats actuelles de la monture
- Carburants disponibles

**Output:**
- Séquence optimale d'actions
- Temps total estimé
- Statégie de gestion de sérénité

**Algorithme:**
1. Analyser les stats actuelles
2. Déterminer l'ordre optimal des jauges
3. Calculer les transitions de sérénité nécessaires
4. Générer le chemin le plus rapide

---

## 9. Stratégies d'Élevage (Tips & Tricks)

### 9.1 Tri par Sérénité
- Grouper les montures par sérénité similaire
- Montures calme (-2000 à -1): Abreuvoir + Foudroyeur
- Montures neutre (0 à 2000): Abreuvoir + Dragofesse
- Montures nerveuse (-5000 à -2001): Caresseur seul
- Montures stressée (2001 à 5000): Baffeur seul

### 9.2 Gestion de la Sérénité
- Rester devant les enclos avec baffeur/caresseur
- Calculer le temps pour atteindre la sérénité cible
- Temps par tier: même formule que les autres jauges (10/20/30/40 par 10 secondes)

### 9.3 Optimisation des Jauges
- Toujours activer jauge XP si une seule jauge est nécessaire
- 2 montures dans l'enclos = 2× gains

### 9.4 Clonage
- Cloner les montures précieuses pour avancer plus vite
- 1 accouplement = 2 montures fécondes (avec capacité reproducteur)

### 9.5 Makinas
- **Optimakina**: +10% génération cible (la meilleure)
- **Animakina**: 5% chance capacité "reproducteur"
- Utiliser dès les générations avancées

---

## 6. Technologies

- **Framework:** Next.js 16.2.1
- **UI:** Tailwind CSS + shadcn/ui (Base UI)
- **State:** Zustand
- **Icons:** Lucide React
- **Animations:** tw-animate-css
- **TypeScript:** Strict mode

---

## 7. Ordre d'Implémentation

1. **Setup et Configuration**
   - Configurer le routing
   - Mettre en place Zustand
   - Créer les types TypeScript

2. **Composants de Base**
   - Layout et navigation
   - Composants UI (Button, Card, Input, Slider)
   - Affichage des jauges

3. **Fonctionnalités Core**
   - Calculateur de temps de jauge (le plus simple)
   - Affichage/gestion des montures
   - Calculateur de génération
   - Planificateur de fécondité (le plus complexe)

---

## 8. Améliorations Futures

- Base de données des montures avec généalogies pré-définies
- Import/export des montures
- Calcul de rentabilité (coût carburant vs valeur monture)
- Mode sombre
- PWA (Progressive Web App)
