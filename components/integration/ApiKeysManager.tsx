import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Copy,
  Key,
  Plus,
  RefreshCw,
  ShieldAlert,
  Shield,
  MoreVertical,
  ClipboardCheck,
  Trash,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Type pour les clés API
interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  permissions: string[];
  status: "active" | "revoked";
}

// Schéma de validation pour le formulaire de création de clé
const createApiKeySchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(50),
  permissions: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Sélectionnez au moins une permission",
  }),
});

type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

// Liste des permissions disponibles
const availablePermissions = [
  {
    id: "read:users",
    label: "Lire les utilisateurs",
    description: "Lire les informations des utilisateurs",
  },
  {
    id: "write:users",
    label: "Écrire les utilisateurs",
    description: "Créer et modifier les utilisateurs",
  },
  {
    id: "delete:users",
    label: "Supprimer les utilisateurs",
    description: "Supprimer des utilisateurs",
  },
  {
    id: "read:projects",
    label: "Lire les projets",
    description: "Accéder aux données des projets",
  },
  {
    id: "write:projects",
    label: "Écrire les projets",
    description: "Créer et modifier les projets",
  },
  {
    id: "read:billing",
    label: "Lire la facturation",
    description: "Accéder aux informations de facturation",
  },
  {
    id: "read:analytics",
    label: "Lire les analyses",
    description: "Accéder aux données analytiques",
  },
];

export default function ApiKeysManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialiser le formulaire
  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  // Charger les clés API
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setIsLoading(true);

        // Simuler un appel API
        // En production, remplacez par un vrai appel API
        setTimeout(() => {
          setApiKeys([
            {
              id: "key_123456",
              name: "Application Web",
              prefix: "fgh5kl",
              createdAt: "2023-08-15T14:30:00Z",
              lastUsed: "2023-10-18T09:45:00Z",
              permissions: ["read:users", "read:projects", "read:analytics"],
              status: "active",
            },
            {
              id: "key_234567",
              name: "Intégration CRM",
              prefix: "jkl9mn",
              createdAt: "2023-09-10T11:20:00Z",
              lastUsed: "2023-10-19T16:30:00Z",
              permissions: [
                "read:users",
                "write:users",
                "read:projects",
                "write:projects",
              ],
              status: "active",
            },
            {
              id: "key_345678",
              name: "Application Mobile",
              prefix: "pqr3st",
              createdAt: "2023-07-20T09:15:00Z",
              lastUsed: null,
              permissions: ["read:users", "read:projects"],
              status: "revoked",
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors du chargement des clés API", error);
        setIsLoading(false);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger vos clés API.",
          variant: "destructive",
        });
      }
    };

    fetchApiKeys();
  }, [toast]);

  // Créer une nouvelle clé API
  const handleCreateApiKey = async (data: CreateApiKeyFormValues) => {
    try {
      // Simuler un appel API pour créer une clé
      // En production, remplacez par un vrai appel API

      const fakeApiKeySecret = `sk_live_${Math.random()
        .toString(36)
        .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const fakePrefix = fakeApiKeySecret.substring(0, 6);

      // Simuler un délai d'API
      setTimeout(() => {
        const newKeyData: ApiKey = {
          id: `key_${Date.now()}`,
          name: data.name,
          prefix: fakePrefix,
          createdAt: new Date().toISOString(),
          lastUsed: null,
          permissions: data.permissions,
          status: "active",
        };

        setApiKeys((prev) => [newKeyData, ...prev]);
        setNewApiKey(fakeApiKeySecret);
        form.reset();
        setShowCreateDialog(false);
      }, 800);
    } catch (error) {
      console.error("Erreur lors de la création de la clé API", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la clé API. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Révoquer une clé API
  const handleRevokeApiKey = async () => {
    if (!selectedKey) return;

    try {
      // Simuler un appel API
      // En production, remplacez par un vrai appel API
      setTimeout(() => {
        setApiKeys((prev) =>
          prev.map((key) =>
            key.id === selectedKey.id
              ? { ...key, status: "revoked" as const }
              : key
          )
        );

        setShowDeleteDialog(false);
        toast({
          title: "Clé API révoquée",
          description: `La clé "${selectedKey.name}" a été révoquée avec succès.`,
        });
      }, 800);
    } catch (error) {
      console.error("Erreur lors de la révocation de la clé API", error);
      toast({
        title: "Erreur",
        description: "Impossible de révoquer la clé API. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Copier la clé dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "Copié dans le presse-papiers",
      description: "La clé API a été copiée dans votre presse-papiers.",
    });
  };

  // Formatage des dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  // Obtenir le libellé d'une permission
  const getPermissionLabel = (permissionId: string) => {
    const permission = availablePermissions.find((p) => p.id === permissionId);
    return permission ? permission.label : permissionId;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vos clés API</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Créer une clé API
        </Button>
      </div>

      {/* Liste des clés API */}
      {apiKeys.length > 0 ? (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card
              key={apiKey.id}
              className={apiKey.status === "revoked" ? "opacity-60" : ""}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {apiKey.name}
                    {apiKey.status === "revoked" && (
                      <Badge variant="destructive" className="ml-2">
                        Révoquée
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{apiKey.prefix}••••••••••••</CardDescription>
                </div>
                {apiKey.status === "active" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedKey(apiKey);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-500"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Révoquer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Date de création</p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(apiKey.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Dernière utilisation
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        {formatDate(apiKey.lastUsed)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {permission.startsWith("read") ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <ShieldAlert className="h-3 w-3" />
                          )}
                          {getPermissionLabel(permission)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune clé API</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore créé de clé API. Créez-en une pour intégrer
              nos services.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Créer une clé API
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Boîte de dialogue de création de clé API */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle clé API</DialogTitle>
            <DialogDescription>
              Créez une clé API pour intégrer nos services à vos applications et
              services tiers.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateApiKey)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la clé</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: Application Web, Intégration CRM..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Un nom descriptif pour identifier l'usage de cette clé.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Permissions</FormLabel>
                      <FormDescription>
                        Sélectionnez les autorisations que vous souhaitez
                        accorder à cette clé API.
                      </FormDescription>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {availablePermissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      permission.id
                                    )}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            permission.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== permission.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal">
                                    {permission.label}
                                  </FormLabel>
                                  <FormDescription>
                                    {permission.description}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Créer la clé API</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue d'affichage de la nouvelle clé */}
      <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clé API créée avec succès</DialogTitle>
            <DialogDescription>
              Veuillez copier votre clé API secrète maintenant. Elle ne sera
              plus jamais affichée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
              {newApiKey}
            </div>

            <div className="flex items-center space-x-2 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                Conservez cette clé en lieu sûr. Vous ne pourrez plus la voir
                par la suite.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => newApiKey && copyToClipboard(newApiKey)}
              className="w-full"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copier dans le
                  presse-papiers
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation de révocation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Révoquer la clé API</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir révoquer cette clé API ? Cette action ne
              peut pas être annulée.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex items-center space-x-3 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              Les applications utilisant cette clé cesseront de fonctionner
              immédiatement.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRevokeApiKey}>
              Révoquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
