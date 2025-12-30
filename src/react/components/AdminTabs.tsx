import { Link } from '@tanstack/react-router';

export default function AdminTabs() {
  return (
    <div className="py-6">
      <nav className="flex items-center justify-center gap-4 md:gap-8 text-sm flex-wrap">
        <Link
          to="/admin/current-contest"
          className="px-2 py-1 text-slate-300 hover:text-white cursor-pointer"
          activeProps={{ className: 'text-emerald-400 font-semibold' }}
        >
          Concorso Corrente
        </Link>
        <Link
          to="/admin/judging"
          className="px-2 py-1 text-slate-300 hover:text-white cursor-pointer"
          activeProps={{ className: 'text-emerald-400 font-semibold' }}
        >
          🏆 Judging
        </Link>
        <Link
          to="/admin/manual-entry"
          className="px-2 py-1 text-slate-300 hover:text-white cursor-pointer"
          activeProps={{ className: 'text-emerald-400 font-semibold' }}
        >
          Inserimento Manuale
        </Link>
        <Link
          to="/admin/create-old-contest"
          className="px-2 py-1 text-slate-300 hover:text-white cursor-pointer"
          activeProps={{ className: 'text-emerald-400 font-semibold' }}
        >
          Gestisci Concorso Passato
        </Link>
      </nav>
    </div>
  );
}
