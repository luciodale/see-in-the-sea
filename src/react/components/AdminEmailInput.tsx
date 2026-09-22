import { Info } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

type AdminEmailInputProps = {
  onEmailSubmit: (email: string) => void;
  isLoading?: boolean;
};

function isValidEmail(value: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function AdminEmailInput({
  onEmailSubmit,
  isLoading = false,
}: AdminEmailInputProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email richiesta');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Inserisci un indirizzo email valido');
      return;
    }

    onEmailSubmit(email.trim());
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col rounded-xl border border-border bg-background">
      <header className="flex flex-col gap-0.5 border-b border-border px-4 py-3">
        <h3 className="text-base font-medium text-foreground">
          Interfaccia Caricamento Amministratore
        </h3>
        <p className="text-xs text-subtle-foreground">
          Inserisci l'indirizzo email dell'utente per cui vuoi caricare le foto
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <Input
            id="user-email"
            label="Indirizzo Email Utente"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={isLoading}
            className="rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          disabled={!email.trim()}
        >
          {isLoading ? 'Caricamento...' : "Accedi all'Interfaccia"}
        </Button>

        <div className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
          <Info
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground"
          />
          <p className="text-xs leading-paragraph text-muted-foreground">
            <span className="font-medium text-foreground">Nota:</span> Potrai
            sfogliare le categorie e caricare foto per conto di questo utente
            per il concorso 2025.
          </p>
        </div>
      </form>
    </section>
  );
}
