// Types pour l'application Dofus Mount Manager

// Types de montures
export type MountType = 'dragodine' | 'muldo' | 'volkorne';
export type Gender = 'male' | 'female';

// Capacités spéciales
export type Capacity = 
  | 'amoureuse' 
  | 'endurante' 
  | 'précoce' 
  | 'sage' 
  | 'reproducteur' 
  | 'caméléone';

// Types de carburants
export type FuelType = 'extrait' | 'philtre' | 'potion' | 'élixir';
export type FuelSize = 'minuscule' | 'petit' | 'normal' | 'grand' | 'gigantesque';

// Types de jauges
export type GaugeType = 'serenity' | 'endurance' | 'maturity' | 'love' | 'experience';
export type Tier = 1 | 2 | 3 | 4;

// Types de Makinas
export type MakinaType = 'animakina' | 'kromakina' | 'optimakina';

// Stats d'une monture
export interface MountStats {
  maturity: number;      // 0-20,000
  endurance: number;     // 0-20,000
  love: number;          // 0-20,000
  experience: number;
  serenity: number;      // -5,000 to +5,000
}

// Monture
export interface Mount {
  id: string;
  name: string;
  type: MountType;
  gender: Gender;
  generation: number;
  level: number;
  genealogy: Genealogy;
  capacities: Capacity[];
  
  // Jauges
  stats: MountStats;
  
  // État
  isFertile: boolean;    // n'a pas encore mis bas
  isFecond: boolean;     // maturité >= 20000 && endurance >= 20000 && love >= 20000
}

// Généalogie
export interface Genealogy {
  parents: [Mount | null, Mount | null];  // père, mère
  grandparents: [Mount | null, Mount | null, Mount | null, Mount | null] | null;
}

// Jauge d'enclos
export interface EnclosureGauge {
  type: GaugeType;
  value: number;           // 0-100,000
  tier: Tier;
  fuelType: FuelType;
  fuelSize: FuelSize;
}

// Enclos
export interface Enclosure {
  id: string;
  name: string;
  mounts: Mount[];
  gauges: Record<GaugeType, EnclosureGauge>;
  activeGauges: GaugeType[];
}

// Carburant
export interface Fuel {
  type: FuelType;
  size: FuelSize;
  durability: number;      // 1000-5000
  tier: Tier;
}

// Makina
export interface Makina {
  type: MakinaType;
  mountType: MountType;
  generation: number;
}

// XP requis par niveau
export const XP_PER_LEVEL = {
  100: 172668,
  200: 867582
} as const;

// Constantes de jeu
export const GAME_CONSTANTS = {
  MAX_GAUGE_VALUE: 100000,
  MAX_STAT_VALUE: 20000,
  SERENITY_MIN: -5000,
  SERENITY_MAX: 5000,
  
  TIER_RANGES: {
    1: { min: 0, max: 40000 },
    2: { min: 40001, max: 70000 },
    3: { min: 70001, max: 90000 },
    4: { min: 90001, max: 100000 },
  } as Record<Tier, { min: number; max: number }>,
  
  TIER_GAINS: {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
  } as Record<Tier, number>,
  
  TIER_DRAIN_TIME: {
    1: 11 * 60 + 6,      // 11 heures 6 minutes en minutes
    2: 4 * 60 + 9,       // 4 heures 9 minutes
    3: 60 + 51,          // 1 heure 51 minutes
    4: 42,               // 42 minutes
  } as Record<Tier, number>,
  
  TOTAL_DRAIN_TIME: 17 * 60 + 48,  // 17 heures 48 minutes
  
  SERENITY_RANGES: {
    NEGATIVE: { min: -5000, max: -1 },
    CALM: { min: -2000, max: -1 },
    NEUTRAL: { min: -2000, max: 2000 },
    POSITIVE: { min: 0, max: 2000 },
    VERY_POSITIVE: { min: 2001, max: 5000 },
  } as const,
  
  GENERATION_TARGET_BASE_CHANCE: 0.30,
  LEVEL_BONUS_PERCENT: 0.0015,  // 0.15% par niveau
  OPTIMAKINA_BONUS: 0.10,       // 10%
  
  CAPACITY_CHANCES: {
    amoureuse: 0.27,
    endurante: 0.27,
    précoce: 0.27,
    sage: 0.14,
    reproducteur: 0.05,
  } as Record<Exclude<Capacity, 'caméléone'>, number>,
} as const;

// Résultats du calculateur de temps
export interface TimeCalculationResult {
  timeInSeconds: number;
  timeFormatted: string;
  fuelRequired: number;
  fuelCost?: number;
}

// Résultats du calculateur de génération
export interface GenerationResult {
  targetGeneration: number;
  crossings: CrossingResult[];
  totalProbability: number;
}

export interface CrossingResult {
  parents: [Mount, Mount];
  baby: Mount;
  probability: number;
  generationTarget: number;
}

// Résultats du planificateur de fécondité
export interface FertilityStep {
  step: number;
  action: 'set_serenity' | 'fill_gauge' | 'wait';
  targetSerenity?: number;
  gauge?: GaugeType;
  tier?: Tier;
  duration: number;
  description: string;
}

export interface FertilityPlan {
  steps: FertilityStep[];
  totalTime: number;
  totalFuel: number;
}
