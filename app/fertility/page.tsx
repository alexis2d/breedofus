"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { 
  calculateFertilityPath, 
  formatTime,
  getGaugesFromSerenity 
} from "@/lib/calculations";
import { Tier } from "@/types";
import { Baby, Clock, Fuel, ListChecks } from "lucide-react";

const tierOptions = [
  { value: "1", label: "Tier 1 (Extrait)" },
  { value: "2", label: "Tier 2 (Philtre)" },
  { value: "3", label: "Tier 3 (Potion)" },
  { value: "4", label: "Tier 4 (Élixir)" },
];

export default function FertilityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Planificateur de Fécondité</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <div className="text-6xl font-bold text-yellow-500 mb-4">WIP</div>
            <h2 className="text-2xl font-semibold mb-2">Work In Progress</h2>
            <p className="text-muted-foreground">
              Cette fonctionnalité est en cours de développement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
