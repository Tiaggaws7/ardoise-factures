"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "btn btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending}>
      {pending && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
}

export function Field({ label, name, defaultValue, type = "text", placeholder, required, hint, className = "", autoComplete }: {
  label: string; name: string; defaultValue?: string | number | null; type?: string; placeholder?: string; required?: boolean; hint?: string; className?: string; autoComplete?: string;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>{label}{required && <span className="text-accent"> *</span>}</label>
      <input id={name} name={name} type={type} className="input" defaultValue={defaultValue ?? ""} placeholder={placeholder} required={required} autoComplete={autoComplete} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
