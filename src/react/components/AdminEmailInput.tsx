import { useState } from 'react';

type AdminEmailInputProps = {
  onEmailSubmit: (email: string) => void;
  isLoading?: boolean;
};

export function AdminEmailInput({ onEmailSubmit, isLoading = false }: AdminEmailInputProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email richiesta');
      return;
    }

    if (!validateEmail(email)) {
      setError('Inserisci un indirizzo email valido');
      return;
    }

    onEmailSubmit(email.trim());
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Interfaccia Caricamento Amministratore
          </h2>
          <p className="text-slate-300 text-sm">
            Inserisci l'indirizzo email dell'utente per cui vuoi caricare le foto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-slate-300 mb-2">
              Indirizzo Email Utente
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isLoading}
            />
            {error && (
              <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            {isLoading ? 'Caricamento...' : 'Accedi all'Interfaccia'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <p className="text-xs text-blue-200">
            <strong>Nota:</strong> Potrai sfogliare le categorie e caricare foto per conto di questo utente per il concorso 2025.
          </p>
        </div>
      </div>
    </div>
  );
}
