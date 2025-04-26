import { KanbanBoard } from "../../../components/crm/KanbanBoard/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="p-6 h-full bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Pipeline des ventes
        </h1>
        <p className="text-gray-600">
          Gérez et suivez vos opportunités de vente
        </p>
      </div>

      <div className="h-[calc(100vh-180px)]">
        <KanbanBoard />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Pipeline des ventes | CRM",
  description:
    "Gérez et suivez vos opportunités de vente avec notre vue Kanban",
};
