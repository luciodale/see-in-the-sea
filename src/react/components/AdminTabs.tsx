import { Link } from '@tanstack/react-router';

export default function AdminTabs() {
  return (
    <div className="py-6">
      <nav className="flex items-center justify-center gap-8 text-sm">
        <Link
          to="/admin/contests"
          className="px-2 py-1 text-slate-300 hover:text-white"
          activeProps={{ className: 'text-emerald-400 font-semibold' }}
        >
          Contests
        </Link>
        <Link
          to="/admin/create"
          className="px-2 py-1 text-slate-300 hover:text-white"
          activeProps={{ className: 'text-emerald-400 font-semibold' }}
        >
          Create Contest
        </Link>
      </nav>
    </div>
  );
}
