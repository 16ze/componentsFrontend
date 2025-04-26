import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { fr } from "date-fns/locale";

import { Document, DocumentType } from "../components/crm/ClientDetails/types";

// Types spécifiques pour la gestion des documents

export type DocumentStatus = "actif" | "archivé" | "supprimé";

export interface DocumentFilters {
  clientId?: string;
  opportunityId?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  dateDebut?: Date;
  dateFin?: Date;
  searchTerm?: string;
}

export type DocumentSortOptions =
  | "date-desc"
  | "date-asc"
  | "nom-asc"
  | "nom-desc"
  | "taille-desc"
  | "taille-asc"
  | "type";

export interface DocumentUploadProgress {
  documentId: string;
  progress: number; // pourcentage de 0 à 100
  status: "en_cours" | "terminé" | "erreur";
  message?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  clientId?: string;
  opportunityId?: string;
}

interface DocumentState {
  documents: Document[];
  uploadQueue: Record<string, File>;
  uploadProgress: DocumentUploadProgress[];
  folders: DocumentFolder[];
  selectedDocument: Document | null;
  selectedFolderId: string | null;
  filters: DocumentFilters;
  sortOption: DocumentSortOptions;

  // Actions de base
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Partial<Document>, file?: File) => Document;
  updateDocument: (document: Document) => void;
  deleteDocument: (documentId: string) => void;
  permanentlyDeleteDocument: (documentId: string) => void;
  archiveDocument: (documentId: string) => void;
  restoreDocument: (documentId: string) => void;
  selectDocument: (documentId: string | null) => void;

  // Gestion de versions
  createNewVersion: (documentId: string, file: File) => void;

  // Gestion des dossiers
  addFolder: (folder: Partial<DocumentFolder>) => DocumentFolder;
  updateFolder: (folder: DocumentFolder) => void;
  deleteFolder: (folderId: string) => void;
  selectFolder: (folderId: string | null) => void;

  // Filtres et tri
  setFilters: (filters: Partial<DocumentFilters>) => void;
  resetFilters: () => void;
  setSortOption: (sortOption: DocumentSortOptions) => void;

  // Gestion des téléchargements
  uploadDocument: (
    clientId: string,
    file: File,
    metadata?: Partial<Document>
  ) => Promise<Document>;
  cancelUpload: (documentId: string) => void;

  // Méthodes utilitaires
  getDocuments: (filters?: DocumentFilters) => Document[];
  getDocumentsByClient: (clientId: string) => Document[];
  getDocumentsByOpportunity: (opportunityId: string) => Document[];
  getDocumentVersions: (documentId: string) => Document[];
}

// Filtres par défaut
const defaultFilters: DocumentFilters = {
  status: "actif",
};

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      uploadQueue: {},
      uploadProgress: [],
      folders: [],
      selectedDocument: null,
      selectedFolderId: null,
      filters: defaultFilters,
      sortOption: "date-desc",

      // Actions de base
      setDocuments: (documents) => set({ documents }),

      addDocument: (document, file) => {
        const newDocument: Document = {
          id: document.id || uuidv4(),
          clientId: document.clientId || "",
          name: document.name || (file ? file.name : "Document sans nom"),
          type: document.type || "other",
          fileUrl: document.fileUrl || "",
          fileSize: document.fileSize || (file ? file.size : 0),
          mimeType:
            document.mimeType ||
            (file ? file.type : "application/octet-stream"),
          uploadedBy: document.uploadedBy || "",
          uploadedAt: document.uploadedAt || new Date(),
          lastModifiedAt: document.lastModifiedAt || new Date(),
          version: document.version || 1,
          previousVersions: document.previousVersions || [],
          relatedOpportunityId: document.relatedOpportunityId,
        };

        set((state) => ({
          documents: [...state.documents, newDocument],
        }));

        return newDocument;
      },

      updateDocument: (document) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === document.id
              ? { ...document, lastModifiedAt: new Date() }
              : d
          ),
          selectedDocument:
            state.selectedDocument?.id === document.id
              ? { ...document, lastModifiedAt: new Date() }
              : state.selectedDocument,
        }));
      },

      deleteDocument: (documentId) => {
        // Marquer comme supprimé au lieu de supprimer définitivement
        const document = get().documents.find((d) => d.id === documentId);
        if (document) {
          get().updateDocument({
            ...document,
            status: "supprimé" as any, // On ajoute le status même s'il n'est pas dans l'interface Document
          });
        }
      },

      permanentlyDeleteDocument: (documentId) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== documentId),
          selectedDocument:
            state.selectedDocument?.id === documentId
              ? null
              : state.selectedDocument,
        }));
      },

      archiveDocument: (documentId) => {
        const document = get().documents.find((d) => d.id === documentId);
        if (document) {
          get().updateDocument({
            ...document,
            status: "archivé" as any,
          });
        }
      },

      restoreDocument: (documentId) => {
        const document = get().documents.find((d) => d.id === documentId);
        if (document) {
          get().updateDocument({
            ...document,
            status: "actif" as any,
          });
        }
      },

      selectDocument: (documentId) => {
        if (!documentId) {
          set({ selectedDocument: null });
          return;
        }

        const document = get().documents.find((d) => d.id === documentId);
        set({ selectedDocument: document || null });
      },

      // Gestion de versions
      createNewVersion: (documentId, file) => {
        const document = get().documents.find((d) => d.id === documentId);
        if (!document) return;

        // Créer une copie de la version actuelle pour l'historique
        const previousVersion: Document = { ...document };

        // Mettre à jour le document avec la nouvelle version
        get().updateDocument({
          ...document,
          fileSize: file.size,
          mimeType: file.type,
          version: document.version + 1,
          lastModifiedAt: new Date(),
          previousVersions: [
            ...(document.previousVersions || []),
            previousVersion,
          ],
        });
      },

      // Gestion des dossiers
      addFolder: (folder) => {
        const newFolder: DocumentFolder = {
          id: folder.id || uuidv4(),
          name: folder.name || "Nouveau dossier",
          parentId: folder.parentId,
          clientId: folder.clientId,
          opportunityId: folder.opportunityId,
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
        }));

        return newFolder;
      },

      updateFolder: (folder) => {
        set((state) => ({
          folders: state.folders.map((f) => (f.id === folder.id ? folder : f)),
        }));
      },

      deleteFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          selectedFolderId:
            state.selectedFolderId === folderId ? null : state.selectedFolderId,
        }));
      },

      selectFolder: (folderId) => {
        set({ selectedFolderId: folderId });
      },

      // Filtres et tri
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      setSortOption: (sortOption) => {
        set({ sortOption });
      },

      // Gestion des téléchargements
      uploadDocument: async (clientId, file, metadata = {}) => {
        const documentId = uuidv4();

        // Ajouter à la queue d'upload
        set((state) => ({
          uploadQueue: { ...state.uploadQueue, [documentId]: file },
          uploadProgress: [
            ...state.uploadProgress,
            {
              documentId,
              progress: 0,
              status: "en_cours",
            },
          ],
        }));

        // Dans une implémentation réelle, il faudrait uploader le fichier au serveur ici
        // Simulation d'un upload
        const simulateUpload = () => {
          return new Promise<string>((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;

              // Mettre à jour la progression
              set((state) => ({
                uploadProgress: state.uploadProgress.map((up) =>
                  up.documentId === documentId ? { ...up, progress } : up
                ),
              }));

              if (progress >= 100) {
                clearInterval(interval);

                // Simuler une URL de fichier
                const fileUrl = `/uploads/${documentId}-${file.name.replace(
                  /\s/g,
                  "_"
                )}`;
                resolve(fileUrl);

                // Mettre à jour le statut une fois terminé
                set((state) => ({
                  uploadProgress: state.uploadProgress.map((up) =>
                    up.documentId === documentId
                      ? { ...up, status: "terminé" }
                      : up
                  ),
                  // Enlever de la queue d'upload
                  uploadQueue: Object.entries(state.uploadQueue).reduce(
                    (acc, [key, value]) => {
                      if (key !== documentId) {
                        acc[key] = value;
                      }
                      return acc;
                    },
                    {} as Record<string, File>
                  ),
                }));
              }
            }, 300);
          });
        };

        try {
          const fileUrl = await simulateUpload();

          // Créer le document dans le store
          const newDocument = get().addDocument({
            id: documentId,
            clientId,
            name: file.name,
            fileUrl,
            fileSize: file.size,
            mimeType: file.type,
            uploadedBy: "utilisateur-courant", // À remplacer par l'ID de l'utilisateur actuel
            uploadedAt: new Date(),
            lastModifiedAt: new Date(),
            version: 1,
            ...metadata,
          });

          return newDocument;
        } catch (error) {
          // Gérer l'erreur
          set((state) => ({
            uploadProgress: state.uploadProgress.map((up) =>
              up.documentId === documentId
                ? { ...up, status: "erreur", message: (error as Error).message }
                : up
            ),
          }));

          throw error;
        }
      },

      cancelUpload: (documentId) => {
        // Annuler l'upload en cours (dans une implémentation réelle, il faudrait annuler la requête)
        set((state) => ({
          uploadProgress: state.uploadProgress.filter(
            (up) => up.documentId !== documentId
          ),
          uploadQueue: Object.entries(state.uploadQueue).reduce(
            (acc, [key, value]) => {
              if (key !== documentId) {
                acc[key] = value;
              }
              return acc;
            },
            {} as Record<string, File>
          ),
        }));
      },

      // Méthodes utilitaires
      getDocuments: (filters = get().filters) => {
        let filtered = get().documents;

        // Filtrage par clientId
        if (filters.clientId) {
          filtered = filtered.filter((d) => d.clientId === filters.clientId);
        }

        // Filtrage par opportunityId
        if (filters.opportunityId) {
          filtered = filtered.filter(
            (d) => d.relatedOpportunityId === filters.opportunityId
          );
        }

        // Filtrage par type
        if (filters.type) {
          filtered = filtered.filter((d) => d.type === filters.type);
        }

        // Filtrage par statut
        if (filters.status) {
          filtered = filtered.filter(
            (d) => (d as any).status === filters.status
          );
        }

        // Filtrage par date
        if (filters.dateDebut) {
          filtered = filtered.filter((d) =>
            isAfter(new Date(d.uploadedAt), new Date(filters.dateDebut as Date))
          );
        }

        if (filters.dateFin) {
          filtered = filtered.filter((d) =>
            isBefore(
              new Date(d.uploadedAt),
              addDays(new Date(filters.dateFin as Date), 1)
            )
          );
        }

        // Filtrage par recherche
        if (filters.searchTerm) {
          const searchTermLower = filters.searchTerm.toLowerCase();
          filtered = filtered.filter(
            (d) =>
              d.name.toLowerCase().includes(searchTermLower) ||
              d.type.toLowerCase().includes(searchTermLower)
          );
        }

        // Tri
        const { sortOption } = get();
        switch (sortOption) {
          case "date-desc":
            filtered.sort(
              (a, b) =>
                new Date(b.uploadedAt).getTime() -
                new Date(a.uploadedAt).getTime()
            );
            break;
          case "date-asc":
            filtered.sort(
              (a, b) =>
                new Date(a.uploadedAt).getTime() -
                new Date(b.uploadedAt).getTime()
            );
            break;
          case "nom-asc":
            filtered.sort((a, b) => a.name.localeCompare(b.name, "fr"));
            break;
          case "nom-desc":
            filtered.sort((a, b) => b.name.localeCompare(a.name, "fr"));
            break;
          case "taille-desc":
            filtered.sort((a, b) => b.fileSize - a.fileSize);
            break;
          case "taille-asc":
            filtered.sort((a, b) => a.fileSize - b.fileSize);
            break;
          case "type":
            filtered.sort((a, b) => a.type.localeCompare(b.type, "fr"));
            break;
        }

        return filtered;
      },

      getDocumentsByClient: (clientId) => {
        return get().getDocuments({ clientId });
      },

      getDocumentsByOpportunity: (opportunityId) => {
        return get().getDocuments({ opportunityId });
      },

      getDocumentVersions: (documentId) => {
        const document = get().documents.find((d) => d.id === documentId);
        if (!document) return [];

        return [document, ...(document.previousVersions || [])];
      },
    }),
    {
      name: "document-store",
      // Ne pas persister certaines propriétés spécifiques qui ne sont pas nécessaires à long terme
      partialize: (state) => ({
        documents: state.documents,
        folders: state.folders,
        filters: state.filters,
        sortOption: state.sortOption,
      }),
    }
  )
);
