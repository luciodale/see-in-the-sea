type Option = { value: string; label: string };

type StyledSelectProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  includeEmptyOption?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
};

export default function StyledSelect({
  id = 'styled-select',
  label,
  value,
  onChange,
  options,
  includeEmptyOption = false,
  emptyLabel = '—',
  disabled = false,
  className = '',
}: StyledSelectProps) {
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
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 pr-10 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
        >
          {includeEmptyOption && <option value="">{emptyLabel}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
    </div>
  );
}
