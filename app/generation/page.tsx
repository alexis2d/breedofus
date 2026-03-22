"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { calculateGenerationChance } from "@/lib/calculations";
import { useMemo, useState } from "react";
import { GitBranch, AlertCircle } from "lucide-react";

export default function GenerationPage() {
  const [parent1Level, setParent1Level] = useState(1);
  const [parent2Level, setParent2Level] = useState(1);
  const [useOptimakina, setUseOptimakina] = useState(false);

  const chance = useMemo(() => {
    return calculateGenerationChance(parent1Level, parent2Level, useOptimakina);
  }, [parent1Level, parent2Level, useOptimakina]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Calculateur de Génération</h1>
        <p className="text-muted-foreground">
          Calculez les chances d'obtenir la génération cible lors d'un accouplement
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Paramètres
            </CardTitle>
            <CardDescription>
              Configurez les paramètres de l'accouplement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent1Level">Niveau parent 1</Label>
                <input
                  id="parent1Level"
                  type="number"
                  value={parent1Level}
                  onChange={(e) => setParent1Level(Number(e.target.value))}
                  min={1}
                  max={200}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent2Level">Niveau parent 2</Label>
                <input
                  id="parent2Level"
                  type="number"
                  value={parent2Level}
                  onChange={(e) => setParent2Level(Number(e.target.value))}
                  min={1}
                  max={200}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="optimakina"
                checked={useOptimakina}
                onChange={(e) => setUseOptimakina(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="optimakina" className="text-sm font-normal">
                Utiliser une Optimakina (+10%)
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
            <CardDescription>
              Probabilités de génération cible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-6xl font-bold text-primary">
                {(chance * 100).toFixed(1)}%
              </div>
              <p className="mt-2 text-muted-foreground">
                Chance de génération cible
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium">Détails du calcul</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chance de base: 30%</li>
                <li>• Bonus niveau: +{((parent1Level + parent2Level) * 0.15).toFixed(1)}%</li>
                <li>• Bonus Optimakina: {useOptimakina ? "+10%" : "+0%"}</li>
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Conseil:</strong> Avec deux parents niveau 200 + Optimakina, 
                vous atteignez 100% de chance de génération cible !
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <code className="bg-muted px-1 py-0.5 rounded">
                Chance Génération Cible = 30% + (Niveau1 + Niveau2) × 0.15% + [Optimakina ? 10% : 0%]
              </code>
            </p>
            <p>
              La chance est partagée entre tous les croisements possibles de la génération cible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
