"use client";

import { useActionState } from "react";
import { saveClient } from "@/actions/clients";
import type { FormState } from "@/actions/auth";
import type { Client } from "@/db/schema";
import { Field, SubmitButton } from "./form-bits";

export function ClientForm({ client }: { client?: Client }) {
  const [state, action] = useActionState<FormState, FormData>(saveClient, undefined);
  return (
    <form action={action} className="card space-y-5 p-6 sm:p-8">
      {client && <input type="hidden" name="id" value={client.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom ou raison sociale" name="name" defaultValue={client?.name} required className="sm:col-span-2" placeholder="Maison Alba" />
        <Field label="Contact" name="contact" defaultValue={client?.contact} placeholder="Inès Alba" />
        <Field label="E-mail" name="email" type="email" defaultValue={client?.email} placeholder="contact@client.fr" />
        <Field label="Téléphone" name="phone" defaultValue={client?.phone} />
        <Field label="SIRET" name="siret" defaultValue={client?.siret} />
        <Field label="Adresse" name="address" defaultValue={client?.address} className="sm:col-span-2" />
        <Field label="Code postal" name="postalCode" defaultValue={client?.postalCode} />
        <Field label="Ville" name="city" defaultValue={client?.city} />
        <Field label="N° de TVA intracommunautaire" name="vatNumber" defaultValue={client?.vatNumber} className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">Notes internes</label>
          <textarea id="notes" name="notes" rows={3} className="input" defaultValue={client?.notes} />
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-bad-soft px-3.5 py-2.5 text-sm text-bad">{state.error}</p>}
      <SubmitButton>{client ? "Enregistrer" : "Ajouter le client"}</SubmitButton>
    </form>
  );
}
