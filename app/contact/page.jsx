import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contactez-nous",
  description: "Envoyez-nous un message via notre formulaire de contact",
};

export default function ContactPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3">Contactez-nous</h1>
        <p className="text-muted-foreground">
          Vous avez une question, une demande ou un projet ? N'hésitez pas à
          nous contacter via le formulaire ci-dessous.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
