import { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Edge,
  Node,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import {
  Clock,
  Mail,
  Play,
  Plus,
  Save,
  Settings,
  Trash2,
  User,
  Users,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlarmClock,
  Tag,
  MessageSquare,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";

// Types
export type AutomationNodeData = {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  type: "trigger" | "action" | "condition" | "delay";
  config?: Record<string, any>;
};

export type AutomationNode = Node<AutomationNodeData>;

// Définition des types de nœuds
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

// Composants pour les nœuds
function TriggerNode({ data }: { data: AutomationNodeData }) {
  return (
    <Card className="w-64 bg-blue-50 border-blue-200">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center">
          {data.icon && <div className="mr-2">{data.icon}</div>}
          {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">{data.description}</p>
      </CardContent>
    </Card>
  );
}

function ActionNode({ data }: { data: AutomationNodeData }) {
  return (
    <Card className="w-64 bg-green-50 border-green-200">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center">
          {data.icon && <div className="mr-2">{data.icon}</div>}
          {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">{data.description}</p>
      </CardContent>
    </Card>
  );
}

function ConditionNode({ data }: { data: AutomationNodeData }) {
  return (
    <Card className="w-64 bg-amber-50 border-amber-200">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center">
          {data.icon && <div className="mr-2">{data.icon}</div>}
          {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">{data.description}</p>
      </CardContent>
    </Card>
  );
}

function DelayNode({ data }: { data: AutomationNodeData }) {
  return (
    <Card className="w-64 bg-purple-50 border-purple-200">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center">
          {data.icon && <div className="mr-2">{data.icon}</div>}
          {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">{data.description}</p>
      </CardContent>
    </Card>
  );
}

// Types d'items pour la toolbox
const triggerItems = [
  {
    id: "contact-created",
    label: "Nouveau contact créé",
    description: "Déclenché quand un nouveau contact est ajouté au CRM",
    icon: <User className="w-4 h-4" />,
    type: "trigger",
  },
  {
    id: "deal-stage-changed",
    label: "Étape d'affaire modifiée",
    description: "Déclenché quand une affaire change d'étape dans le pipeline",
    icon: <RefreshCw className="w-4 h-4" />,
    type: "trigger",
  },
  {
    id: "form-submitted",
    label: "Formulaire soumis",
    description: "Déclenché quand un formulaire est soumis sur votre site",
    icon: <CheckCircle2 className="w-4 h-4" />,
    type: "trigger",
  },
  {
    id: "tag-added",
    label: "Tag ajouté",
    description: "Déclenché quand un tag est ajouté à un contact",
    icon: <Tag className="w-4 h-4" />,
    type: "trigger",
  },
];

const actionItems = [
  {
    id: "send-email",
    label: "Envoyer un email",
    description: "Envoyer un email personnalisé au contact",
    icon: <Mail className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "update-contact",
    label: "Mettre à jour contact",
    description: "Modifier les informations d'un contact",
    icon: <User className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "create-task",
    label: "Créer une tâche",
    description: "Créer une tâche assignée à un utilisateur",
    icon: <CheckCircle2 className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "add-to-segment",
    label: "Ajouter à segment",
    description: "Ajouter le contact à un segment spécifique",
    icon: <Users className="w-4 h-4" />,
    type: "action",
  },
  {
    id: "send-sms",
    label: "Envoyer un SMS",
    description: "Envoyer un SMS au contact",
    icon: <MessageSquare className="w-4 h-4" />,
    type: "action",
  },
];

const conditionItems = [
  {
    id: "condition-property",
    label: "Condition sur propriété",
    description: "Vérifier la valeur d'une propriété du contact",
    icon: <Filter className="w-4 h-4" />,
    type: "condition",
  },
  {
    id: "condition-segment",
    label: "Appartient au segment",
    description: "Vérifier si le contact appartient à un segment",
    icon: <Users className="w-4 h-4" />,
    type: "condition",
  },
  {
    id: "condition-activity",
    label: "Activité récente",
    description: "Vérifier si le contact a eu une activité récente",
    icon: <Clock className="w-4 h-4" />,
    type: "condition",
  },
];

const delayItems = [
  {
    id: "delay-fixed",
    label: "Délai fixe",
    description: "Attendre un délai fixe avant de continuer",
    icon: <Clock className="w-4 h-4" />,
    type: "delay",
  },
  {
    id: "delay-until-time",
    label: "Attendre jusqu'à",
    description: "Attendre jusqu'à un moment précis",
    icon: <AlarmClock className="w-4 h-4" />,
    type: "delay",
  },
];

export type AutomationBuilderProps = {
  initialNodes?: AutomationNode[];
  initialEdges?: Edge[];
  onSave?: (nodes: AutomationNode[], edges: Edge[]) => void;
  readOnly?: boolean;
};

export function AutomationBuilder({
  initialNodes = [],
  initialEdges = [],
  onSave,
  readOnly = false,
}: AutomationBuilderProps) {
  // État pour les nœuds et arêtes
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // État pour le nœud sélectionné
  const [selectedNode, setSelectedNode] = useState<AutomationNode | null>(null);

  // État pour le dialogue de configuration
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Ajouter une connexion
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { strokeWidth: 2, stroke: "#64748b" },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Gérer la sélection d'un nœud
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as AutomationNode);
    setConfigDialogOpen(true);
  }, []);

  // Ajouter un nouveau nœud au flux
  const addNodeToFlow = (item: any, position = { x: 100, y: 100 }) => {
    const newNode: AutomationNode = {
      id: `${item.id}-${uuidv4()}`,
      type: item.type,
      position,
      data: {
        label: item.label,
        description: item.description,
        icon: item.icon,
        type: item.type,
        config: {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // Fonction pour gérer le drag-and-drop
  const onDragStart = (event: React.DragEvent, item: any) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as Element)
        .closest(".react-flow")
        ?.getBoundingClientRect();

      if (!reactFlowBounds) return;

      try {
        const item = JSON.parse(
          event.dataTransfer.getData("application/reactflow")
        );

        // Calculer la position où l'élément a été déposé
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        addNodeToFlow(item, position);
      } catch (error) {
        console.error("Error parsing dragged item:", error);
      }
    },
    [addNodeToFlow]
  );

  // Fonction pour mettre à jour la configuration d'un nœud
  const updateNodeConfig = (config: Record<string, any>) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              config,
            },
          };
        }
        return node;
      })
    );

    setConfigDialogOpen(false);
  };

  // Fonction pour supprimer un nœud
  const deleteNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );

    setConfigDialogOpen(false);
  };

  // Afficher la configuration en fonction du type de nœud
  const renderNodeConfig = () => {
    if (!selectedNode) return null;

    const { type, config = {} } = selectedNode.data;

    switch (type) {
      case "trigger":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du déclencheur</Label>
              <Input
                id="name"
                defaultValue={config.name || ""}
                placeholder="Nom du déclencheur"
              />
            </div>
            {selectedNode.data.label === "Nouveau contact créé" && (
              <div>
                <Label htmlFor="source">Source du contact</Label>
                <Select defaultValue={config.source || ""}>
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Toutes les sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les sources</SelectItem>
                    <SelectItem value="website">Site web</SelectItem>
                    <SelectItem value="manual">Ajout manuel</SelectItem>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case "action":
        if (selectedNode.data.label === "Envoyer un email") {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Modèle d'email</Label>
                <Select defaultValue={config.template || ""}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Email de bienvenue</SelectItem>
                    <SelectItem value="follow-up">Suivi commercial</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="custom">Email personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  defaultValue={config.subject || ""}
                  placeholder="Sujet de l'email"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="actionName">Nom de l'action</Label>
              <Input
                id="actionName"
                defaultValue={config.name || ""}
                placeholder="Nom de l'action"
              />
            </div>
          </div>
        );

      case "condition":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field">Champ</Label>
              <Select defaultValue={config.field || ""}>
                <SelectTrigger id="field">
                  <SelectValue placeholder="Sélectionner un champ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="company">Entreprise</SelectItem>
                  <SelectItem value="segment">Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operator">Opérateur</Label>
              <Select defaultValue={config.operator || ""}>
                <SelectTrigger id="operator">
                  <SelectValue placeholder="Sélectionner un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Égal à</SelectItem>
                  <SelectItem value="contains">Contient</SelectItem>
                  <SelectItem value="not_empty">N'est pas vide</SelectItem>
                  <SelectItem value="greater_than">Plus grand que</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valeur</Label>
              <Input
                id="value"
                defaultValue={config.value || ""}
                placeholder="Valeur à comparer"
              />
            </div>
          </div>
        );

      case "delay":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="delayType">Type de délai</Label>
              <Select defaultValue={config.delayType || "minutes"}>
                <SelectTrigger id="delayType">
                  <SelectValue placeholder="Type de délai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Heures</SelectItem>
                  <SelectItem value="days">Jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="delayValue">Valeur</Label>
              <Input
                id="delayValue"
                type="number"
                min="1"
                defaultValue={config.value || "1"}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Sauvegarder l'automatisation
  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  return (
    <div className="h-[70vh] w-full border rounded-lg bg-white">
      <Tabs defaultValue="editor">
        <div className="flex border-b">
          <TabsList className="m-2">
            <TabsTrigger value="editor">Éditeur</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          <div className="flex-1" />
          <div className="flex items-center p-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={readOnly}
            >
              <Save className="h-4 w-4 mr-1" />
              Enregistrer
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-1" />
              Tester
            </Button>
          </div>
        </div>

        <TabsContent value="editor" className="m-0 h-full flex">
          <div
            className="w-72 border-r overflow-auto h-full p-4"
            style={{ maxHeight: "calc(70vh - 50px)" }}
          >
            <h3 className="text-sm font-medium mb-2">Déclencheurs</h3>
            <div className="space-y-2 mb-4">
              {triggerItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2 border rounded-md bg-blue-50 cursor-move flex items-center hover:bg-blue-100"
                  draggable={!readOnly}
                  onDragStart={(e) => onDragStart(e, item)}
                >
                  {item.icon}
                  <span className="ml-2 text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-medium mb-2">Actions</h3>
            <div className="space-y-2 mb-4">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2 border rounded-md bg-green-50 cursor-move flex items-center hover:bg-green-100"
                  draggable={!readOnly}
                  onDragStart={(e) => onDragStart(e, item)}
                >
                  {item.icon}
                  <span className="ml-2 text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-medium mb-2">Conditions</h3>
            <div className="space-y-2 mb-4">
              {conditionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2 border rounded-md bg-amber-50 cursor-move flex items-center hover:bg-amber-100"
                  draggable={!readOnly}
                  onDragStart={(e) => onDragStart(e, item)}
                >
                  {item.icon}
                  <span className="ml-2 text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-medium mb-2">Délais</h3>
            <div className="space-y-2">
              {delayItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2 border rounded-md bg-purple-50 cursor-move flex items-center hover:bg-purple-100"
                  draggable={!readOnly}
                  onDragStart={(e) => onDragStart(e, item)}
                >
                  {item.icon}
                  <span className="ml-2 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex-1 h-full"
            style={{ height: "calc(70vh - 50px)" }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onNodeClick={onNodeClick}
              fitView
              proOptions={{ hideAttribution: true }}
              connectionLineStyle={{ strokeWidth: 2, stroke: "#64748b" }}
              defaultEdgeOptions={{
                animated: true,
                style: { strokeWidth: 2, stroke: "#64748b" },
              }}
            >
              <Background color="#f1f5f9" gap={16} />
              <Controls />
              <MiniMap
                nodeStrokeColor="(n) => n.data.color || '#000'"
                nodeColor="(n) => n.data.color || '#fff'"
              />
            </ReactFlow>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'automatisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflowName">Nom de l'automatisation</Label>
                <Input
                  id="workflowName"
                  placeholder="Ex: Séquence de bienvenue client"
                  className="mb-2"
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="workflowDescription">Description</Label>
                <Input
                  id="workflowDescription"
                  placeholder="Décrivez le but de cette automatisation..."
                  className="mb-2"
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select disabled={readOnly} defaultValue="draft">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="paused">En pause</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de configuration de nœud */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedNode?.data.label}</DialogTitle>
            <DialogDescription>
              Configurer les paramètres de{" "}
              {selectedNode?.data.label.toLowerCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">{renderNodeConfig()}</div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={deleteNode}
              disabled={readOnly}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfigDialogOpen(false)}
                className="mr-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={() =>
                  updateNodeConfig(selectedNode?.data.config || {})
                }
                disabled={readOnly}
              >
                Appliquer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
