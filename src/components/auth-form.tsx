"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { logIn, signUp, type FormState } from "@/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? logIn : signUp, undefined);
  return (
    <form action={action} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="name">Votre nom</label>
          <input id="name" name="name" className="input" autoComplete="name" required placeholder="Camille Laurent" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required placeholder="vous@exemple.fr" />
      </div>
      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" className="input" required minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? "8 caractères minimum" : "••••••••"} />
      </div>
      {next && <input type="hidden" name="next" value={next} />}
      {state?.error && <p role="alert" className="rounded-xl bg-bad-soft px-3.5 py-2.5 text-sm text-bad">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" size={16} />}
        {mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
      {mode === "signup" && (
        <p className="text-center text-xs text-muted">
          En créant un compte, vous acceptez les <Link href="/cgu-cgv" className="underline">CGU/CGV</Link> et la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.
        </p>
      )}
    </form>
  );
}
