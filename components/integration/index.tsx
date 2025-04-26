"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationList } from "./IntegrationList";
import { AutomationList } from "./AutomationList";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function IntegrationCenter() {
  const [activeTab, setActiveTab] = useState("integrations");

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Centre d'Intégration</h1>
          <p className="text-muted-foreground">
            Gérez vos intégrations et automatisations pour connecter vos
            applications
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          {activeTab === "integrations"
            ? "Nouvelle Intégration"
            : "Nouvelle Automatisation"}
        </Button>
      </div>

      <Tabs
        defaultValue="integrations"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          <TabsTrigger value="automations">Automatisations</TabsTrigger>
        </TabsList>
        <TabsContent value="integrations" className="mt-6">
          <IntegrationList />
        </TabsContent>
        <TabsContent value="automations" className="mt-6">
          <AutomationList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
