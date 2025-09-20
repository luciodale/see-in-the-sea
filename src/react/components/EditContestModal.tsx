import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { BaseModal } from './BaseModal';
import StyledSelect from './StyledSelect';

type EditContestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contest: {
    id: string;
    name: string;
    description: string | null;
    year: number;
    status: 'active' | 'inactive' | 'assessment';
    maxSubmissionsPerCategory: number;
  };
  onSuccess: () => void;
};

export default function EditContestModal({
  isOpen,
  onClose,
  contest,
  onSuccess,
}: EditContestModalProps) {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: contest.name,
    description: contest.description || '',
    year: String(contest.year),
    status: contest.status as 'active' | 'inactive' | 'assessment',
    maxSubmissionsPerCategory: String(contest.maxSubmissionsPerCategory),
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setForm({
        name: contest.name,
        description: contest.description || '',
        year: String(contest.year),
        status: contest.status,
        maxSubmissionsPerCategory: String(contest.maxSubmissionsPerCategory),
      });
    }
  }, [isOpen, contest]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const year = parseInt(form.year, 10);
      const max = parseInt(form.maxSubmissionsPerCategory, 10);
      if (!form.name.trim() || Number.isNaN(year) || Number.isNaN(max)) {
        throw new Error(
          'Please provide a valid name, year and max submissions.'
        );
      }

      const token = await getToken();
      const res = await fetch('/api/admin/manage-contest', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: contest.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          year,
          status: form.status,
          maxSubmissionsPerCategory: max,
        }),
      });
      const json: { success?: boolean; message?: string } = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update contest');
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update contest');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Contest"
      isLoading={saving}
      loadingMessage="Updating contest..."
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-900/40 border border-red-800 rounded-lg">
          <p className="text-red-200 text-sm">❌ {error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="contest-name" className="block text-sm mb-1">
            Name
          </label>
          <input
            id="contest-name"
            type="text"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="contest-desc" className="block text-sm mb-1">
            Description
          </label>
          <textarea
            id="contest-desc"
            rows={3}
            value={form.description}
            onChange={e =>
              setForm(prev => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="contest-year" className="block text-sm mb-1">
              Year
            </label>
            <input
              id="contest-year"
              type="number"
              inputMode="numeric"
              value={form.year}
              onChange={e =>
                setForm(prev => ({ ...prev, year: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <StyledSelect
              id="contest-status"
              label="Status"
              value={form.status}
              onChange={value =>
                setForm(prev => ({
                  ...prev,
                  status: value as 'active' | 'inactive' | 'assessment',
                }))
              }
              options={[
                { value: 'active', label: 'active' },
                { value: 'inactive', label: 'inactive' },
                { value: 'assessment', label: 'assessment' },
              ]}
            />
          </div>
          <div>
            <label htmlFor="contest-max" className="block text-sm mb-1">
              Max per Category
            </label>
            <input
              id="contest-max"
              type="number"
              inputMode="numeric"
              value={form.maxSubmissionsPerCategory}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  maxSubmissionsPerCategory: e.target.value,
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-700 rounded-md cursor-pointer hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md disabled:opacity-50 transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
