"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  calculateTimeToFillGauge, 
  calculateXPTime, 
  calculateCurrentTier 
} from "@/lib/calculations";
import { GaugeType, Capacity } from "@/types";

const gaugeOptions: { value: GaugeType; label: string }[] = [
  { value: "love", label: "Amour" },
  { value: "maturity", label: "Maturité" },
  { value: "endurance", label: "Endurance" },
  { value: "baffeur", label: "Baffeur" },
  { value: "caresseur", label: "Caresseur" },
];

// Fuel value ranges determine consumption per 10 seconds:
// 0-40000: 10 per tick
// 40001-70000: 20 per tick
// 70001-90000: 30 per tick
// 90001+: 40 per tick
const fuelValueRanges = [
  { min: 0, max: 40000, tier: 1, label: "0 - 40 000 (10/tick)" },
  { min: 40001, max: 70000, tier: 2, label: "40 001 - 70 000 (20/tick)" },
  { min: 70001, max: 90000, tier: 3, label: "70 001 - 90 000 (30/tick)" },
  { min: 90001, max: Infinity, tier: 4, label: "90 001+ (40/tick)" },
];

export default function TimersPage() {
  const [currentValue, setCurrentValue] = useState(0);
  const [targetValue, setTargetValue] = useState(20000);
  const [gaugeType, setGaugeType] = useState<GaugeType>("love");
  const [fuelValue, setFuelValue] = useState(100000);
  const mountCount = 10;
  const [hasSageCapacity, setHasSageCapacity] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(100);
  const [tab, setTab] = useState<"gauge" | "xp">("gauge");

  // Calculate tier based on fuel value
  const tier = calculateCurrentTier(fuelValue);

  // Auto-adjust values for baffeur/caresseur (range -5000 to 5000)
  useEffect(() => {
    if (gaugeType === "baffeur" || gaugeType === "caresseur") {
      setCurrentValue(-5000);
      setTargetValue(5000);
    } else if (gaugeType === "love" || gaugeType === "maturity" || gaugeType === "endurance") {
      setCurrentValue(0);
      setTargetValue(20000);
    }
  }, [gaugeType]);

  const gaugeResult = useMemo(() => {
    return calculateTimeToFillGauge(
      currentValue,
      targetValue,
      tier,
      1,
      null
    );
  }, [currentValue, targetValue, tier]);

  const xpResult = useMemo(() => {
    return calculateXPTime(currentLevel, targetLevel, tier, 1, hasSageCapacity);
  }, [currentLevel, targetLevel, tier, hasSageCapacity]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Calculateurs de Temps</h1>
        <p className="text-muted-foreground">
          Estimez le temps nécessaire pour monter vos jauges ou l'expérience de vos montures
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("gauge")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "gauge" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Jauge
        </button>
        <button
          onClick={() => setTab("xp")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "xp" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Expérience
        </button>
      </div>

      {tab === "gauge" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>Configurez votre calculateur de jauge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gaugeType">Type de jauge</Label>
                <Select value={gaugeType} onValueChange={(v: string) => setGaugeType(v as GaugeType)}>
                  <SelectTrigger id="gaugeType">
                    <SelectValue placeholder="Sélectionner une jauge" />
                  </SelectTrigger>
                  <SelectContent>
                    {gaugeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentValue">Valeur actuelle</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Valeur cible</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelValue">Valeur du carburant</Label>
                <Input
                  id="fuelValue"
                  type="number"
                  value={fuelValue}
                  onChange={(e) => setFuelValue(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Tier actuel: {tier} ({tier * 10}/tour)
                </p>
              </div>

              <div className="space-y-4">
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résultat</CardTitle>
              <CardDescription>Temps estimé pour remplir la jauge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl font-bold text-primary">
                  {gaugeResult.timeFormatted}
                </div>
                <p className="mt-2 text-muted-foreground">
                  Temps total estimé
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="rounded-lg bg-muted p-4">
                  <div className="font-medium">Gains par tour (progression)</div>
                  <div className="text-2xl font-bold">
                    {fuelValue > 90000 
                      ? `+40 → +30 → +20 → +10`
                      : fuelValue > 70000
                        ? `+30 → +20 → +10`
                        : fuelValue > 40000
                          ? `+20 → +10`
                          : `+10`}
                  </div>
                  <div className="text-muted-foreground">
                    {fuelValue > 90000 
                      ? '90 001+ → 70 001-90 000 → 40 001-70 000 → 0-40 000'
                      : fuelValue > 70000
                        ? '70 001-90 000 → 40 001-70 000 → 0-40 000'
                        : fuelValue > 40000
                          ? '40 001-70 000 → 0-40 000'
                          : '0-40 000'}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Détails du calcul</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Valeur à gagner: {targetValue - currentValue}</li>
                  <li>• Tier: {tier} ({["Extrait", "Philtre", "Potion", "Élixir"][tier - 1]})</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres XP</CardTitle>
              <CardDescription>Configurez votre calculateur d'expérience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentLevel">Niveau actuel</Label>
                  <Input
                    id="currentLevel"
                    type="number"
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(Number(e.target.value))}
                    min={1}
                    max={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetLevel">Niveau cible</Label>
                  <Select 
                    value={String(targetLevel)} 
                    onValueChange={(v: string) => setTargetLevel(Number(v))}
                  >
                    <SelectTrigger id="targetLevel">
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Niveau 100</SelectItem>
                      <SelectItem value="200">Niveau 200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelValueXP">Valeur du carburant</Label>
                <Input
                  id="fuelValueXP"
                  type="number"
                  value={fuelValue}
                  onChange={(e) => setFuelValue(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Tier actuel: {tier} ({tier * 10}/tour)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasSageCapacity"
                    checked={hasSageCapacity}
                    onChange={(e) => setHasSageCapacity(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="hasSageCapacity" className="text-sm font-normal">
                    À la capacité Sage (XP doublée)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résultat XP</CardTitle>
              <CardDescription>Temps estimé pour gagner l'expérience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl font-bold text-primary">
                  {xpResult.timeFormatted}
                </div>
                <p className="mt-2 text-muted-foreground">
                  Temps total estimé
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="rounded-lg bg-muted p-4">
                  <div className="font-medium">XP requise</div>
                  <div className="text-2xl font-bold">
                    {xpResult.xpNeeded.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">points</div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Détails du calcul</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Niveau {currentLevel} → {targetLevel}</li>
                  <li>• XP/secondes: {tier * (hasSageCapacity ? 2 : 1)}</li>
                  <li>• Bonus Sage: {hasSageCapacity ? "Oui (×2)" : "Non"}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
