import { ContactsManager } from "@/components/dashboard/ContactsManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contatos de Emergência" };

export default function ContactsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Contatos de Emergência</h1>
        <p className="mt-1 text-base text-gray-500">
          Gerencie as pessoas para acionar quando uma queda for detectada.
        </p>
      </div>

      <div className="max-w-2xl">
        <ContactsManager />
      </div>
    </div>
  );
}
