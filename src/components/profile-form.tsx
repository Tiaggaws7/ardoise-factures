"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { ImagePlus, Lock, Trash2 } from "lucide-react";
import { saveProfile } from "@/actions/profile";
import type { FormState } from "@/actions/auth";
import type { Profile } from "@/db/schema";
import { TEMPLATES } from "@/lib/plan";
import { VAT_RATES } from "@/lib/money";
import { Field, SubmitButton } from "./form-bits";

/** Redimensionne le logo (max 360 px) en PNG avant envoi : léger et compatible PDF. */
async function resizeLogo(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 360 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export function ProfileForm({ profile, pro, welcome }: { profile: Profile; pro: boolean; welcome?: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(saveProfile, undefined);
  const [regime, setRegime] = useState(profile.vatRegime);
  const [logo, setLogo] = useState<string | null>(profile.logo);
  const [logoError, setLogoError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoError(undefined);
    try {
      if (!/^image\/(png|jpe?g|webp|gif)$/.test(f.type)) throw new Error("Format non pris en charge (PNG, JPEG ou WebP).");
      const data = await resizeLogo(f);
      if (data.length > 440_000) throw new Error("Image trop lourde, choisissez un logo plus simple.");
      setLogo(data);
    } catch (err) {
      setLogoError((err as Error).message);
    }
  }

  return (
    <form action={action} className="space-y-6">
      {welcome && (
        <div className="rounded-2xl border border-accent/30 bg-accent-soft p-5 text-accent-dark">
          <p className="font-semibold">Bienvenue ! 👋</p>
          <p className="mt-1 text-sm">Renseignez votre identité professionnelle : elle apparaîtra sur tous vos documents. Il vous faudra au minimum votre adresse et votre SIRET pour émettre une facture.</p>
        </div>
      )}

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Identité</h2>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <div className="grid h-20 w-32 place-items-center overflow-hidden rounded-2xl border border-dashed border-line bg-white">
            {logo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logo} alt="Logo" className="max-h-16 max-w-28 object-contain" /> : <ImagePlus className="text-muted" />}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" id="logo-file" onChange={onFile} />
            <div className="flex gap-2">
              <label htmlFor="logo-file" className="btn btn-ghost btn-sm cursor-pointer">{logo ? "Changer le logo" : "Ajouter un logo"}</label>
              {logo && <button type="button" className="btn btn-ghost btn-sm text-bad" onClick={() => setLogo(null)}><Trash2 size={14} />Retirer</button>}
            </div>
            <p className="mt-1.5 text-xs text-muted">PNG ou JPEG. Redimensionné automatiquement.</p>
            {logoError && <p className="mt-1 text-xs text-bad">{logoError}</p>}
          </div>
          <input type="hidden" name="logo" value={logo ?? ""} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Votre nom complet" name="fullName" defaultValue={profile.fullName} required autoComplete="name" />
          <Field label="Nom commercial (optionnel)" name="businessName" defaultValue={profile.businessName} placeholder="Atelier Laurent" />
          <Field label="E-mail de contact" name="email" type="email" defaultValue={profile.email} required />
          <Field label="Téléphone" name="phone" defaultValue={profile.phone} />
          <Field label="Adresse" name="address" defaultValue={profile.address} className="sm:col-span-2" autoComplete="street-address" />
          <Field label="Code postal" name="postalCode" defaultValue={profile.postalCode} autoComplete="postal-code" />
          <Field label="Ville" name="city" defaultValue={profile.city} autoComplete="address-level2" />
          <Field label="SIRET" name="siret" defaultValue={profile.siret} placeholder="123 456 789 00012" hint="14 chiffres, obligatoire sur les factures." className="sm:col-span-2" />
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">TVA</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {([
            ["franchise", "Franchise en base de TVA", "Mention « TVA non applicable, art. 293 B du CGI » ajoutée automatiquement."],
            ["assujetti", "Assujetti à la TVA", "La TVA est calculée et votre numéro est affiché sur les documents."],
          ] as const).map(([v, t, d]) => (
            <label key={v} className={`cursor-pointer rounded-2xl border p-4 transition ${regime === v ? "border-accent bg-accent-soft/60 ring-4 ring-accent/10" : "border-line bg-white hover:border-ink/25"}`}>
              <input type="radio" name="vatRegime" value={v} checked={regime === v} onChange={() => setRegime(v)} className="sr-only" />
              <span className="block font-semibold">{t}</span>
              <span className="mt-1 block text-sm text-ink/65">{d}</span>
            </label>
          ))}
        </div>
        {regime === "assujetti" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="N° de TVA intracommunautaire" name="vatNumber" defaultValue={profile.vatNumber} placeholder="FR12345678901" required />
            <div>
              <label className="label" htmlFor="defaultVatRate">Taux par défaut</label>
              <select id="defaultVatRate" name="defaultVatRate" className="input" defaultValue={profile.defaultVatRate}>
                {VAT_RATES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
              </select>
            </div>
          </div>
        ) : (
          <>
            <input type="hidden" name="vatNumber" value="" />
            <input type="hidden" name="defaultVatRate" value="0" />
          </>
        )}
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Règlement</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="IBAN (affiché sur les factures)" name="iban" defaultValue={profile.iban} placeholder="FR76 3000 6000 0112 3456 7890 189" className="sm:col-span-2" />
          <Field label="BIC" name="bic" defaultValue={profile.bic} />
          <Field label="Délai de paiement (jours)" name="paymentDays" type="number" defaultValue={profile.paymentDays} />
          <div className="sm:col-span-2">
            <label className="label" htmlFor="legalFooter">Mentions de pied de page des factures</label>
            <textarea id="legalFooter" name="legalFooter" rows={3} className="input" defaultValue={profile.legalFooter} />
            <p className="mt-1 text-xs text-muted">Pénalités de retard et indemnité de recouvrement : usuelles pour les clients professionnels.</p>
          </div>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Modèle de PDF</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((t) => {
            const locked = t.pro && !pro;
            return (
              <label key={t.id} className={`relative rounded-2xl border p-4 transition ${locked ? "cursor-not-allowed border-line bg-paper/60 opacity-70" : "cursor-pointer border-line bg-white hover:border-ink/25 has-[:checked]:border-accent has-[:checked]:bg-accent-soft/60 has-[:checked]:ring-4 has-[:checked]:ring-accent/10"}`}>
                <input type="radio" name="template" value={t.id} defaultChecked={(locked ? "classique" : profile.template) === t.id} disabled={locked} className="sr-only" />
                <span className="flex items-center justify-between font-semibold">{t.name}{locked && <span className="inline-flex items-center gap-1 text-xs text-accent"><Lock size={12} />Pro</span>}</span>
                <span className="mt-1 block text-sm text-ink/65">{t.blurb}</span>
              </label>
            );
          })}
        </div>
        {!pro && (
          <>
            <input type="hidden" name="template" value="classique" />
            <p className="mt-4 text-sm text-muted">Les 3 autres modèles sont réservés à l'offre Pro. <Link href="/abonnement" className="font-semibold text-accent hover:underline">Découvrir le Pro</Link></p>
          </>
        )}
      </section>

      {state?.error && <p role="alert" className="rounded-xl bg-bad-soft px-4 py-3 text-sm font-medium text-bad">{state.error}</p>}
      {state?.ok && <p role="status" className="animate-page rounded-xl bg-ok-soft px-4 py-3 text-sm font-medium text-ok">✓ Profil enregistré.</p>}
      <SubmitButton>Enregistrer le profil</SubmitButton>
    </form>
  );
}
