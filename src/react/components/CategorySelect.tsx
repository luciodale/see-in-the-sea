import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

type Category = { id: string; name: string };

type CategorySelectProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  allLabel?: string;
  disabled?: boolean;
  className?: string;
};

export default function CategorySelect({
  id = 'category-select',
  label,
  value,
  onChange,
  includeAllOption = true,
  allLabel = 'All',
  disabled = false,
  className = '',
}: CategorySelectProps) {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const res = await fetch('/api/admin/categories', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json: unknown = await res.json();
        if (
          res.ok &&
          (json as { success?: boolean }).success &&
          (json as { data?: Category[] }).data
        ) {
          if (!isMounted) return;
          setCategories((json as { data: Category[] }).data);
        } else {
          throw new Error((json as { message?: string }).message || 'Failed');
        }
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load categories');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-slate-200 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          disabled={disabled || loading || !!error}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 pr-10 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
        >
          {includeAllOption && <option value="">{allLabel}</option>}
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}
