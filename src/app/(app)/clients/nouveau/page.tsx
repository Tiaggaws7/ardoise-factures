import type { Metadata } from "next";
import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Nouveau client" };

export default function Page() {
  return (
    <>
      <PageHeader title="Nouveau client" />
      <ClientForm />
    </>
  );
}
