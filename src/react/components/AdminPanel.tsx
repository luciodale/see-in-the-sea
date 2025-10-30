import { useUserRole } from '../hooks/useUserRole';

export default function AdminPanel() {
  const { isAdmin, role, isLoaded } = useUserRole();

  if (!isLoaded) {
    return <div>Caricamento permessi utente...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">
          ❌ Accesso Negato - Ruolo amministratore richiesto. Il tuo ruolo:{' '}
          {role || 'user'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h3 className="text-lg font-semibold text-green-800 mb-3">
        👑 Pannello Amministratore
      </h3>
      <p className="text-green-700">
        ✅ Benvenuto Amministratore! Hai accesso alle funzionalità
        amministrative.
      </p>

      {/* Your admin-only content here */}
      <div className="mt-4 space-y-2">
        <a
          href="/admin"
          className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors cursor-pointer"
        >
          🛠️ Dashboard Amministratore
        </a>
      </div>
    </div>
  );
}
