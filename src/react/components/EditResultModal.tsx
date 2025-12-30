import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type {
  UpdateResultRequest,
  UpdateResultResponse,
} from '../../types/api';
import { BaseModal } from './BaseModal';
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
      if (!token) throw new Error('Token di autenticazione non disponibile');
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
        throw new Error(data.message || 'Impossibile aggiornare il risultato');
      onSuccess();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Impossibile aggiornare il risultato'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifica Risultato"
      isLoading={saving}
      loadingMessage="Aggiornamento risultato..."
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-900/40 border border-red-800 rounded-lg">
          <p className="text-red-200 text-sm">❌ {error}</p>
        </div>
      )}
      <div className="space-y-3">
        <StyledSelect
          id="placement-select"
          label="Posizionamento"
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
          Nome
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
          Cognome
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
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm border border-slate-700 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md disabled:opacity-50 transition-colors cursor-pointer"
        >
          Salva
        </button>
      </div>
    </BaseModal>
  );
}
