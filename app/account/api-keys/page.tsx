import { Metadata } from "next";
import ApiKeysManager from "@/components/integration/ApiKeysManager";

export const metadata: Metadata = {
  title: "Gestion des Clés API | Mon Application SaaS",
  description:
    "Créez et gérez vos clés API pour intégrer nos services à vos applications.",
};

export default function ApiKeysPage() {
  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Clés API</h1>
        <p className="text-muted-foreground mt-2">
          Créez et gérez vos clés API pour intégrer nos services à vos
          applications et services tiers
        </p>
      </div>

      <ApiKeysManager />
    </div>
  );
}
