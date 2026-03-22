import { create } from 'zustand';
import { 
  Mount, 
  Enclosure,
  EnclosureGauge,
  GaugeType, 
  Tier, 
  FuelType, 
  FuelSize,
  MountStats,
  Capacity,
  MountType,
  Gender 
} from '@/types';

// Générateur d'ID unique
const generateId = () => Math.random().toString(36).substring(2, 15);

// Valeurs par défaut pour les stats
const createDefaultStats = (): MountStats => ({
  maturity: 0,
  endurance: 0,
  love: 0,
  experience: 0,
  serenity: 0,
});

// Store des montures
interface MountStore {
  mounts: Mount[];
  addMount: (mount: Omit<Mount, 'id'>) => Mount;
  updateMount: (id: string, updates: Partial<Mount>) => void;
  deleteMount: (id: string) => void;
  getMountById: (id: string) => Mount | undefined;
}

export const useMountStore = create<MountStore>((set, get) => ({
  mounts: [],
  
  addMount: (mountData) => {
    const newMount: Mount = {
      ...mountData,
      id: generateId(),
    };
    set((state) => ({ mounts: [...state.mounts, newMount] }));
    return newMount;
  },
  
  updateMount: (id, updates) => {
    set((state) => ({
      mounts: state.mounts.map((mount) =>
        mount.id === id ? { ...mount, ...updates } : mount
      ),
    }));
  },
  
  deleteMount: (id) => {
    set((state) => ({
      mounts: state.mounts.filter((mount) => mount.id !== id),
    }));
  },
  
  getMountById: (id) => {
    return get().mounts.find((mount) => mount.id === id);
  },
}));

// Store des enclos
interface EnclosureStore {
  enclosures: Enclosure[];
  addEnclosure: (name: string) => Enclosure;
  updateEnclosure: (id: string, updates: Partial<Enclosure>) => void;
  deleteEnclosure: (id: string) => void;
  addMountToEnclosure: (enclosureId: string, mountId: string) => void;
  removeMountFromEnclosure: (enclosureId: string, mountId: string) => void;
  setActiveGauges: (enclosureId: string, gauges: GaugeType[]) => void;
}

const createDefaultGauge = (type: GaugeType): EnclosureGauge => ({
  type,
  value: 0,
  tier: 1 as Tier,
  fuelType: 'extrait' as FuelType,
  fuelSize: 'normal' as FuelSize,
});

export const useEnclosureStore = create<EnclosureStore>((set) => ({
  enclosures: [],
  
  addEnclosure: (name) => {
    const newEnclosure: Enclosure = {
      id: generateId(),
      name,
      mounts: [],
      gauges: {
        serenity: createDefaultGauge('serenity'),
        endurance: createDefaultGauge('endurance'),
        maturity: createDefaultGauge('maturity'),
        love: createDefaultGauge('love'),
        experience: createDefaultGauge('experience'),
      },
      activeGauges: [],
    };
    set((state) => ({ enclosures: [...state.enclosures, newEnclosure] }));
    return newEnclosure;
  },
  
  updateEnclosure: (id, updates) => {
    set((state) => ({
      enclosures: state.enclosures.map((enclosure) =>
        enclosure.id === id ? { ...enclosure, ...updates } : enclosure
      ),
    }));
  },
  
  deleteEnclosure: (id) => {
    set((state) => ({
      enclosures: state.enclosures.filter((enclosure) => enclosure.id !== id),
    }));
  },
  
  addMountToEnclosure: (enclosureId, mountId) => {
    const mountStore = useMountStore.getState();
    const mount = mountStore.getMountById(mountId);
    if (!mount) return;
    
    set((state) => ({
      enclosures: state.enclosures.map((enclosure) =>
        enclosure.id === enclosureId
          ? { ...enclosure, mounts: [...enclosure.mounts, mount] }
          : enclosure
      ),
    }));
  },
  
  removeMountFromEnclosure: (enclosureId, mountId) => {
    set((state) => ({
      enclosures: state.enclosures.map((enclosure) =>
        enclosure.id === enclosureId
          ? { ...enclosure, mounts: enclosure.mounts.filter((m) => m.id !== mountId) }
          : enclosure
      ),
    }));
  },
  
  setActiveGauges: (enclosureId, gauges) => {
    set((state) => ({
      enclosures: state.enclosures.map((enclosure) =>
        enclosure.id === enclosureId
          ? { ...enclosure, activeGauges: gauges.slice(0, 2) } // Max 2 gauges
          : enclosure
      ),
    }));
  },
}));

// Store du calculateur de temps
interface CalculatorStore {
  // Input du calculateur de temps
  currentGaugeValue: number;
  targetGaugeValue: number;
  gaugeType: GaugeType;
  fuelType: FuelType;
  fuelSize: FuelSize;
  mountCount: number;
  hasCapacity: Capacity | null;
  
  // Setters
  setCurrentGaugeValue: (value: number) => void;
  setTargetGaugeValue: (value: number) => void;
  setGaugeType: (type: GaugeType) => void;
  setFuelType: (type: FuelType) => void;
  setFuelSize: (size: FuelSize) => void;
  setMountCount: (count: number) => void;
  setHasCapacity: (capacity: Capacity | null) => void;
  
  // Reset
  reset: () => void;
}

const defaultCalculatorState = {
  currentGaugeValue: 0,
  targetGaugeValue: 20000,
  gaugeType: 'love' as GaugeType,
  fuelType: 'élixir' as FuelType,
  fuelSize: 'gigantesque' as FuelSize,
  mountCount: 1,
  hasCapacity: null as Capacity | null,
};

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  ...defaultCalculatorState,
  
  setCurrentGaugeValue: (value) => set({ currentGaugeValue: value }),
  setTargetGaugeValue: (value) => set({ targetGaugeValue: value }),
  setGaugeType: (type) => set({ gaugeType: type }),
  setFuelType: (type) => set({ fuelType: type }),
  setFuelSize: (size) => set({ fuelSize: size }),
  setMountCount: (count) => set({ mountCount: count }),
  setHasCapacity: (capacity) => set({ hasCapacity: capacity }),
  
  reset: () => set(defaultCalculatorState),
}));

// Store du calculateur de génération
interface GenerationStore {
  parent1: Mount | null;
  parent2: Mount | null;
  useOptimakina: boolean;
  
  setParent1: (mount: Mount | null) => void;
  setParent2: (mount: Mount | null) => void;
  setUseOptimakina: (use: boolean) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  parent1: null,
  parent2: null,
  useOptimakina: false,
  
  setParent1: (mount) => set({ parent1: mount }),
  setParent2: (mount) => set({ parent2: mount }),
  setUseOptimakina: (use) => set({ useOptimakina: use }),
  reset: () => set({ parent1: null, parent2: null, useOptimakina: false }),
}));

// Store du planificateur de fécondité
interface FertilityStore {
  mount: Mount | null;
  
  setMount: (mount: Mount | null) => void;
  reset: () => void;
}

export const useFertilityStore = create<FertilityStore>((set) => ({
  mount: null,
  
  setMount: (mount) => set({ mount: mount }),
  reset: () => set({ mount: null }),
}));

// Helper pour créer une monture par défaut
export const createDefaultMount = (
  name: string,
  type: MountType,
  gender: Gender,
  generation: number = 1
): Omit<Mount, 'id'> => ({
  name,
  type,
  gender,
  generation,
  level: 1,
  genealogy: {
    parents: [null, null],
    grandparents: null,
  },
  capacities: [],
  stats: createDefaultStats(),
  isFertile: true,
  isFecond: false,
});
