import { 
  GAME_CONSTANTS, 
  XP_PER_LEVEL,
  TimeCalculationResult,
  Tier,
  FuelType,
  FuelSize,
  GaugeType,
  Capacity,
  MountStats,
  FertilityPlan,
  FertilityStep,
} from '@/types';

// Durabilité des carburants par taille
const fuelDurabilityMap: Record<FuelSize, number> = {
  minuscule: 1000,
  petit: 2000,
  normal: 3000,
  grand: 4000,
  gigantesque: 5000,
};

// Tier对应的燃料等级
const FUEL_TIER_MAP: Record<FuelType, Tier> = {
  extrait: 1,
  philtre: 2,
  potion: 3,
  élixir: 4,
};

// Obtenir le tier du carburant
export const getFuelTier = (fuelType: FuelType): Tier => {
  return FUEL_TIER_MAP[fuelType];
};

// Obtenir la durabilité du carburant
export const getFuelDurability = (fuelSize: FuelSize): number => {
  return fuelDurabilityMap[fuelSize];
};

// Calculer le tier actuel d'une jauge
export const calculateCurrentTier = (value: number): Tier => {
  if (value <= 40000) return 1;
  if (value <= 70000) return 2;
  if (value <= 90000) return 3;
  return 4;
};

// Calculer le gain par tour (10 secondes)
export const calculateGainPerTick = (
  tier: Tier,
  mountCount: number,
  capacity?: Capacity | null
): number => {
  const baseGain = GAME_CONSTANTS.TIER_GAINS[tier];
  
  // Appliquer le bonus de capacité si applicable
  let multiplier = 1;
  if (capacity === 'amoureuse') multiplier = 2;
  if (capacity === 'endurante') multiplier = 2;
  if (capacity === 'précoce') multiplier = 2;
  
  return baseGain * mountCount * multiplier;
};

// Formater le temps en secondes vers un format lisible
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}min ${secs}s`;
  }
  return `${secs}s`;
};

// Calculer le temps pour passer d'une valeur à une autre
export const calculateTimeToFillGauge = (
  currentValue: number,
  targetValue: number,
  tier: Tier,
  mountCount: number,
  capacity?: Capacity | null
): TimeCalculationResult => {
  const valueToGain = Math.max(0, targetValue - currentValue);
  const gainPerTick = calculateGainPerTick(tier, mountCount, capacity);
  
  if (gainPerTick === 0) {
    return {
      timeInSeconds: Infinity,
      timeFormatted: 'Infini',
      fuelRequired: 0,
    };
  }
  
  // Nombre de tours de 10 secondes nécessaires
  const ticksNeeded = Math.ceil(valueToGain / gainPerTick);
  const timeInSeconds = ticksNeeded * 10;
  
  // Calculer le carburant nécessaire (par tour: tier * 10 de consommation)
  const consumptionPerTick = GAME_CONSTANTS.TIER_GAINS[tier] * mountCount;
  const fuelRequired = (consumptionPerTick * ticksNeeded) / 1000; // En milliers
  
  return {
    timeInSeconds,
    timeFormatted: formatTime(timeInSeconds),
    fuelRequired: Math.ceil(fuelRequired),
  };
};

// Calculateur d'XP
export interface XPCalculationResult {
  xpNeeded: number;
  timeInSeconds: number;
  timeFormatted: string;
  fuelRequired: number;
}

// Fonction pour calculer l'XP cumulative jusqu'à un niveau
const getCumulativeXP = (level: number): number => {
  if (level <= 0) return 0;
  if (level <= 100) {
    return (level / 100) * XP_PER_LEVEL[100];
  }
  // Interpolation linéaire entre 100 et 200
  return XP_PER_LEVEL[100] + ((level - 100) / 100) * (XP_PER_LEVEL[200] - XP_PER_LEVEL[100]);
};

export const calculateXPTime = (
  currentLevel: number,
  targetLevel: number,
  tier: Tier,
  mountCount: number,
  hasSage: boolean = false
): XPCalculationResult => {
  // XP nécessaire entre les niveaux
  const xpNeeded = getCumulativeXP(targetLevel) - getCumulativeXP(currentLevel);
  
  // XP par seconde
  const baseXPPerSecond = tier;
  const xpPerSecond = hasSage ? baseXPPerSecond * 2 : baseXPPerSecond;
  
  // Temps en secondes
  const timeInSeconds = Math.ceil(xpNeeded / xpPerSecond);
  
  // Carburant nécessaire (par 10 secondes)
  const consumptionPerTick = GAME_CONSTANTS.TIER_GAINS[tier] * mountCount;
  const ticks = Math.ceil(timeInSeconds / 10);
  const fuelRequired = (consumptionPerTick * ticks) / 1000;
  
  return {
    xpNeeded: Math.ceil(xpNeeded),
    timeInSeconds,
    timeFormatted: formatTime(timeInSeconds),
    fuelRequired: Math.ceil(fuelRequired),
  };
};

// Calculer le temps pour changer la sérénité
export const calculateSerenityTime = (
  currentSerenity: number,
  targetSerenity: number,
  tier: Tier
): number => {
  const serenityDiff = Math.abs(targetSerenity - currentSerenity);
  const gainPerTick = GAME_CONSTANTS.TIER_GAINS[tier];
  
  if (gainPerTick === 0) return Infinity;
  
  const ticksNeeded = Math.ceil(serenityDiff / gainPerTick);
  return ticksNeeded * 10;
};

// Déterminer quels jauges peuvent être montées selon la sérénité
export const getGaugesFromSerenity = (serenity: number): GaugeType[] => {
  const { SERENITY_RANGES } = GAME_CONSTANTS;
  
  if (serenity >= SERENITY_RANGES.CALM.min && serenity <= SERENITY_RANGES.CALM.max) {
    return ['maturity', 'endurance'];
  }
  if (serenity >= SERENITY_RANGES.POSITIVE.min && serenity <= SERENITY_RANGES.POSITIVE.max) {
    return ['maturity', 'love'];
  }
  if (serenity < SERENITY_RANGES.CALM.min) {
    return ['endurance'];
  }
  return ['love'];
};

// Planificateur de fécondité
export const calculateFertilityPath = (
  stats: MountStats,
  tier: Tier = 4,
  mountCount: number = 1
): FertilityPlan => {
  const steps: FertilityStep[] = [];
  let currentSerenity = stats.serenity;
  const currentStats = { ...stats };
  let totalTime = 0;
  let totalFuel = 0;
  let stepCount = 0;
  
  // Déterminer quelles jauges ont besoin d'être montées
  const gaugesNeeded: GaugeType[] = [];
  if (currentStats.maturity < 20000) gaugesNeeded.push('maturity');
  if (currentStats.endurance < 20000) gaugesNeeded.push('endurance');
  if (currentStats.love < 20000) gaugesNeeded.push('love');
  
  // Pour chaque jauge manquante, calculer le chemin
  for (const gauge of gaugesNeeded) {
    const targetValue = 20000;
    const currentValue = currentStats[gauge];
    const valueToGain = targetValue - currentValue;
    
    if (valueToGain <= 0) continue;
    
    // Déterminer la sérénité nécessaire pour cette jauge
    let targetSerenity: number;
    if (gauge === 'endurance') {
      targetSerenity = -1000; // Sérénité négative
    } else if (gauge === 'love') {
      targetSerenity = 1000; // Sérénité positive
    } else {
      targetSerenity = 0; // Sérénité moyenne pour maturité
    }
    
    // Ajuster la sérénité si nécessaire
    if (currentSerenity !== targetSerenity) {
      const serenityTime = calculateSerenityTime(currentSerenity, targetSerenity, tier);
      stepCount++;
      steps.push({
        step: stepCount,
        action: 'set_serenity',
        targetSerenity,
        duration: serenityTime,
        description: `Ajuster la sérénité à ${targetSerenity} pour monter ${gauge}`,
      });
      totalTime += serenityTime;
      currentSerenity = targetSerenity;
    }
    
    // Remplir la jauge
    const gainPerTick = calculateGainPerTick(tier, mountCount, null);
    const ticksNeeded = Math.ceil(valueToGain / gainPerTick);
    const fillTime = ticksNeeded * 10;
    
    stepCount++;
    steps.push({
      step: stepCount,
      action: 'fill_gauge',
      gauge,
      tier,
      duration: fillTime,
      description: `Remplir ${gauge} de ${currentValue} à ${targetValue}`,
    });
    
    totalTime += fillTime;
    currentStats[gauge] = targetValue;
    
    // Calculer le carburant
    const consumptionPerTick = GAME_CONSTANTS.TIER_GAINS[tier] * mountCount;
    const fuelForThisGauge = (consumptionPerTick * ticksNeeded) / 1000;
    totalFuel += Math.ceil(fuelForThisGauge);
  }
  
  return {
    steps,
    totalTime,
    totalFuel,
  };
};

// Calculer les chances de génération cible
export const calculateGenerationChance = (
  parent1Level: number,
  parent2Level: number,
  useOptimakina: boolean
): number => {
  const baseChance = GAME_CONSTANTS.GENERATION_TARGET_BASE_CHANCE;
  const levelBonus = (parent1Level + parent2Level) * GAME_CONSTANTS.LEVEL_BONUS_PERCENT;
  const optimakinaBonus = useOptimakina ? GAME_CONSTANTS.OPTIMAKINA_BONUS : 0;
  
  return Math.min(1, baseChance + levelBonus + optimakinaBonus);
};

// Obtenir les probabilities de capacités avec Animakina
export const getCapacityProbabilities = (): Record<string, number> => {
  return { ...GAME_CONSTANTS.CAPACITY_CHANCES };
};
