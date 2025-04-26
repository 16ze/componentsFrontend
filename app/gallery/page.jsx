import { ImageGallery } from "@/components/gallery/ImageGallery";

export const metadata = {
  title: "Galerie d'images",
  description: "Explorez notre collection d'images",
};

export default function GalleryPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold mb-4 text-center">Notre Galerie</h1>
        <p className="text-muted-foreground text-center">
          Explorez notre collection d'images dans différentes catégories.
          Utilisez les filtres pour affiner votre recherche.
        </p>
      </div>

      <ImageGallery />
    </div>
  );
}
