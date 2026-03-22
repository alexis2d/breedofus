import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, GitBranch, Baby, Scale } from "lucide-react";

const features = [
  {
    title: "Calculateurs de Temps",
    description: "Estimez le temps nécessaire pour monter vos jauges d'amour, maturité ou endurance",
    href: "/timers",
    icon: Heart,
  },
  {
    title: "Génération de Montures",
    description: "Calculez les probabilités de génération cible lors des accouplements",
    href: "/generation",
    icon: GitBranch,
  },
  {
    title: "Planificateur de Fécondité",
    description: "Trouvez le chemin le plus rapide pour rendre vos montures fécondes",
    href: "/fertility",
    icon: Baby,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Breedofus</h1>
        <p className="text-muted-foreground">
          Gérez facilement votre élevage de montures Dofus avec nos outils de calcul
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Comment utiliser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Calculateurs de temps</strong> - Entrez vos statistiques actuelles et vos carburants pour estimer le temps de montée de jauge
            </li>
            <li>
              <strong>Génération</strong> - Sélectionnez deux montures parents pour voir les probabilités de génération cible
            </li>
            <li>
              <strong>Fécondité</strong> - Obtenez un plan étape par étape pour rendre vos montures fécondes le plus rapidement possible
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
