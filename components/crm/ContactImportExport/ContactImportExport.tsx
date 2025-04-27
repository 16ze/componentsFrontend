import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Check,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types pour le composant
export type ContactField = {
  id: string;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "phone" | "date" | "number" | "select";
  options?: string[];
};

export type ContactImportExportProps = {
  fields: ContactField[];
  onImport?: (
    data: any[],
    mappings: Record<string, string>
  ) => Promise<{ success: boolean; message?: string }>;
  onExport?: () => Promise<any[]>;
  exportFileName?: string;
  sampleData?: any[];
  isLoading?: boolean;
};

export function ContactImportExport({
  fields,
  onImport,
  onExport,
  exportFileName = "contacts-export.xlsx",
  sampleData,
  isLoading = false,
}: ContactImportExportProps) {
  // État pour l'import
  const [importedData, setImportedData] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [importStep, setImportStep] = useState(1);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // État pour l'export
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // Référence pour l'input de fichier
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser les options d'exportation
  useState(() => {
    const options: { [key: string]: boolean } = {};
    fields.forEach((field) => {
      options[field.id] = true;
    });
    setExportOptions(options);
  });

  // Gérer l'import de fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (typeof data !== "string") return;

        let parsedData: any[] = [];

        if (file.name.endsWith(".csv")) {
          // Traiter CSV
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          // Traiter Excel
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
        } else {
          throw new Error("Format de fichier non supporté");
        }

        if (parsedData.length === 0) {
          throw new Error("Le fichier ne contient pas de données");
        }

        // Extraire les entêtes du fichier importé
        const headers = Object.keys(parsedData[0]);

        // Initialiser les mappages avec une correspondance automatique si possible
        const initialMappings: Record<string, string> = {};
        fields.forEach((field) => {
          // Essayer de trouver une correspondance automatique (insensible à la casse)
          const matchingHeader = headers.find(
            (header) =>
              header.toLowerCase() === field.label.toLowerCase() ||
              header.toLowerCase() === field.id.toLowerCase()
          );

          if (matchingHeader) {
            initialMappings[field.id] = matchingHeader;
          }
        });

        setMappings(initialMappings);
        setImportedData(parsedData);
        setImportStep(2);
        setImportDialogOpen(true);

        // Réinitialiser l'input de fichier
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Erreur lors de l'import:", error);
        setImportResult({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Erreur lors de l'import du fichier",
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  // Simuler le processus d'import
  const processImport = async () => {
    try {
      setImportStep(3);
      setImportProgress(0);

      // Simuler un chargement progressif
      const interval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      // Appeler la fonction d'import
      let result = { success: true };

      if (onImport) {
        result = await onImport(importedData, mappings);
      }

      // Terminer le chargement
      clearInterval(interval);
      setImportProgress(100);

      // Afficher le résultat
      setImportResult(result);
      setImportStep(4);
    } catch (error) {
      setImportResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Erreur lors de l'import",
      });
      setImportStep(4);
    }
  };

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      setExportProgress(0);

      // Simuler un chargement progressif
      const interval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Récupérer les données à exporter
      let dataToExport: any[] = [];

      if (onExport) {
        dataToExport = await onExport();
      } else if (sampleData) {
        dataToExport = sampleData;
      }

      // Filtrer les champs selon les options d'exportation
      const filteredFields = fields.filter((field) => exportOptions[field.id]);

      // Transformer les données pour ne garder que les champs sélectionnés
      const formattedData = dataToExport.map((item) => {
        const formattedItem: Record<string, any> = {};
        filteredFields.forEach((field) => {
          formattedItem[field.label] = item[field.id];
        });
        return formattedItem;
      });

      // Créer le workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(formattedData);
      XLSX.utils.book_append_sheet(wb, ws, "Contacts");

      // Terminer le chargement
      clearInterval(interval);
      setExportProgress(100);

      // Télécharger le fichier
      setTimeout(() => {
        if (exportFormat === "xlsx") {
          XLSX.writeFile(wb, exportFileName);
        } else {
          XLSX.writeFile(wb, exportFileName.replace(".xlsx", ".csv"));
        }
        setExportDialogOpen(false);
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      setExportProgress(0);
    }
  };

  // Réinitialiser l'import
  const resetImport = () => {
    setImportedData([]);
    setMappings({});
    setImportStep(1);
    setImportProgress(0);
    setImportResult(null);
    setImportDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importation & Exportation</CardTitle>
        <CardDescription>
          Importez ou exportez vos contacts au format Excel ou CSV
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="import">
          <TabsList className="mb-4">
            <TabsTrigger value="import">Importer</TabsTrigger>
            <TabsTrigger value="export">Exporter</TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <div className="space-y-4">
              <div className="border rounded-lg p-6 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Importer des contacts
                </h3>
                <p className="text-muted-foreground mb-4">
                  Formats supportés: Excel (.xlsx, .xls) et CSV (.csv)
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="mr-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Sélectionner un fichier
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open("/templates/contacts-import-template.xlsx")
                  }
                >
                  Télécharger modèle
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium mb-1">Conseils pour l'import</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Utilisez notre modèle pour éviter les erreurs de format
                  </li>
                  <li>
                    Assurez-vous que vos données respectent les formats requis
                  </li>
                  <li>Pour les dates, utilisez le format YYYY-MM-DD</li>
                  <li>
                    Vous pourrez associer vos colonnes aux champs appropriés
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-4">
              <div className="border rounded-lg p-6 text-center">
                <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Exporter vos contacts
                </h3>
                <p className="text-muted-foreground mb-4">
                  Téléchargez vos contacts aux formats Excel ou CSV
                </p>
                <Button
                  onClick={() => setExportDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exporter les contacts
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium mb-1">Options d'exportation</h4>
                <p>Lors de l'export, vous pourrez:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Choisir les champs à inclure</li>
                  <li>Sélectionner le format d'export (Excel ou CSV)</li>
                  <li>
                    Appliquer des filtres pour n'exporter que certains contacts
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Modals pour l'import */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importer des contacts</DialogTitle>
            <DialogDescription>
              {importStep === 2 &&
                `Mappez les champs du fichier avec les champs de contacts (${importedData.length} contacts détectés)`}
              {importStep === 3 && "Importation des contacts en cours..."}
              {importStep === 4 &&
                (importResult?.success
                  ? "Importation réussie!"
                  : "Une erreur est survenue lors de l'importation")}
            </DialogDescription>
          </DialogHeader>

          {importStep === 2 && (
            <>
              <div className="border rounded-md overflow-hidden mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Champ contact</TableHead>
                      <TableHead>Champ fichier</TableHead>
                      <TableHead className="w-[150px]">Aperçu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mappings[field.id] || ""}
                            onValueChange={(value) => {
                              setMappings((prev) => ({
                                ...prev,
                                [field.id]: value,
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une colonne" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Non importé</SelectItem>
                              {importedData.length > 0 &&
                                Object.keys(importedData[0]).map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-[150px]">
                          {mappings[field.id] && importedData.length > 0
                            ? String(importedData[0][mappings[field.id]] || "")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-muted p-4 rounded-md mb-4">
                <h4 className="font-medium mb-2">Aperçu des données</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {importedData.length > 0 &&
                          Object.keys(importedData[0]).map((header) => (
                            <TableHead
                              key={header}
                              className="whitespace-nowrap"
                            >
                              {header}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedData.slice(0, 3).map((row, index) => (
                        <TableRow key={index}>
                          {Object.keys(importedData[0]).map((header) => (
                            <TableCell
                              key={`${index}-${header}`}
                              className="whitespace-nowrap"
                            >
                              {String(row[header] || "")}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {importedData.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    + {importedData.length - 3} autres lignes
                  </p>
                )}
              </div>

              {/* Vérifier les champs requis */}
              {fields.some(
                (field) => field.required && !mappings[field.id]
              ) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Attention</AlertTitle>
                  <AlertDescription>
                    Certains champs obligatoires ne sont pas mappés.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {importStep === 3 && (
            <div className="py-8">
              <Progress value={importProgress} className="mb-4" />
              <p className="text-center text-sm text-muted-foreground">
                Importation en cours ({importProgress}%)...
              </p>
            </div>
          )}

          {importStep === 4 && (
            <div className="py-4">
              {importResult?.success ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Importation réussie!
                  </h3>
                  <p className="text-center text-muted-foreground mb-4">
                    {importedData.length} contacts ont été importés avec succès.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Échec de l'importation
                  </h3>
                  <p className="text-center text-muted-foreground mb-4">
                    {importResult?.message ||
                      "Une erreur est survenue lors de l'importation des contacts."}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {importStep === 2 && (
              <>
                <Button variant="outline" onClick={resetImport}>
                  Annuler
                </Button>
                <Button
                  onClick={processImport}
                  disabled={fields.some(
                    (field) => field.required && !mappings[field.id]
                  )}
                >
                  Importer {importedData.length} contacts
                </Button>
              </>
            )}

            {importStep === 4 && <Button onClick={resetImport}>Fermer</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour l'export */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter les contacts</DialogTitle>
            <DialogDescription>Configurez votre export</DialogDescription>
          </DialogHeader>

          {exportProgress > 0 && exportProgress < 100 ? (
            <div className="py-8">
              <Progress value={exportProgress} className="mb-4" />
              <p className="text-center text-sm text-muted-foreground">
                Préparation de l'export ({exportProgress}%)...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Format d'export</h4>
                  <div className="flex gap-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="format-xlsx"
                        checked={exportFormat === "xlsx"}
                        onCheckedChange={() => setExportFormat("xlsx")}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="format-xlsx">Excel (.xlsx)</Label>
                        <p className="text-sm text-muted-foreground">
                          Format standard avec formatage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="format-csv"
                        checked={exportFormat === "csv"}
                        onCheckedChange={() => setExportFormat("csv")}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="format-csv">CSV (.csv)</Label>
                        <p className="text-sm text-muted-foreground">
                          Compatible avec tous les systèmes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Champs à exporter
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`field-${field.id}`}
                          checked={exportOptions[field.id] || false}
                          onCheckedChange={(checked) => {
                            setExportOptions((prev) => ({
                              ...prev,
                              [field.id]: !!checked,
                            }));
                          }}
                        />
                        <Label htmlFor={`field-${field.id}`}>
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setExportDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleExport}>Exporter</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
