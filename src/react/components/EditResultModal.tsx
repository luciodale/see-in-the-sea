import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type {
  UpdateResultRequest,
  UpdateResultResponse,
} from '../../types/api.js';
import StyledSelect from './StyledSelect';

type EditResultModalProps = {
  isOpen: boolean;
  onClose: () => void;
  result: {
    resultId: string;
    submissionId: string;
    contestId: string;
    categoryId: string;
    result: 'first' | 'second' | 'third' | 'runner-up';
    firstName: string | null;
    lastName: string | null;
  };
  onSuccess: () => void;
};

export default function EditResultModal({
  isOpen,
  onClose,
  result,
  onSuccess,
}: EditResultModalProps) {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    result: UpdateResultRequest['result'];
    firstName: string;
    lastName: string;
  }>({
    result: result.result,
    firstName: result.firstName || '',
    lastName: result.lastName || '',
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setForm({
        result: result.result,
        firstName: result.firstName || '',
        lastName: result.lastName || '',
      });
    }
  }, [isOpen, result]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Auth token not available');
      const res = await fetch('/api/admin/manage-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resultId: result.resultId,
          result: form.result,
          firstName: form.firstName || null,
          lastName: form.lastName || null,
        } satisfies UpdateResultRequest),
      });
      const data: UpdateResultResponse = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || 'Failed to update result');
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update result');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md text-slate-200">
        <h3 className="text-lg font-semibold mb-4">Edit Result</h3>
        {error && <div className="mb-3 text-sm text-red-300">{error}</div>}
        <div className="space-y-3">
          <StyledSelect
            id="placement-select"
            label="Placement"
            value={form.result}
            onChange={value =>
              setForm(prev => ({
                ...prev,
                result: value as typeof prev.result,
              }))
            }
            options={[
              { value: 'first', label: 'first' },
              { value: 'second', label: 'second' },
              { value: 'third', label: 'third' },
              { value: 'runner-up', label: 'runner-up' },
            ]}
          />

          <label className="block text-sm" htmlFor="first-name">
            First Name
          </label>
          <input
            id="first-name"
            type="text"
            value={form.firstName}
            onChange={e =>
              setForm(prev => ({ ...prev, firstName: e.target.value }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <label className="block text-sm" htmlFor="last-name">
            Last Name
          </label>
          <input
            id="last-name"
            type="text"
            value={form.lastName}
            onChange={e =>
              setForm(prev => ({ ...prev, lastName: e.target.value }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
