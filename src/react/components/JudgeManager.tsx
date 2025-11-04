import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import type {
  CreateJudgeResponse,
  DeleteJudgeResponse,
  Judge,
  UpdateJudgeResponse,
} from '../../types/api';

interface JudgeManagerProps {
  contestId: string;
  judges: Judge[];
  onUpdate: () => void;
}

export const JudgeManager = ({
  contestId,
  judges,
  onUpdate,
}: JudgeManagerProps) => {
  const { getToken } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [editingJudgeId, setEditingJudgeId] = useState<string | null>(null);
  const [editJudgeName, setEditJudgeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddJudge = async () => {
    if (!newJudgeName.trim()) {
      setError('Il nome del giudice è obbligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = await getToken();
      const response = await fetch('/api/admin/contest-judges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contestId,
          fullName: newJudgeName.trim(),
        }),
      });

      const result: CreateJudgeResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Errore durante l'aggiunta");
      }

      setNewJudgeName('');
      setShowAddForm(false);
      onUpdate();
    } catch (err) {
      console.error('Error adding judge:', err);
      setError(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJudge = async (judgeId: string) => {
    if (!editJudgeName.trim()) {
      setError('Il nome del giudice è obbligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = await getToken();
      const response = await fetch('/api/admin/contest-judges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          judgeId,
          fullName: editJudgeName.trim(),
        }),
      });

      const result: UpdateJudgeResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Errore durante l'aggiornamento");
      }

      setEditingJudgeId(null);
      setEditJudgeName('');
      onUpdate();
    } catch (err) {
      console.error('Error updating judge:', err);
      setError(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJudge = async (judgeId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo giudice?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(
        `/api/admin/contest-judges?judgeId=${judgeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: DeleteJudgeResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Errore durante l'eliminazione");
      }

      onUpdate();
    } catch (err) {
      console.error('Error deleting judge:', err);
      setError(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (judge: Judge) => {
    setEditingJudgeId(judge.id);
    setEditJudgeName(judge.fullName);
  };

  const cancelEditing = () => {
    setEditingJudgeId(null);
    setEditJudgeName('');
  };

  return (
    <div className="space-y-4">
      {/* Add Judge Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Giudici</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={isSubmitting}
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {showAddForm ? 'Annulla' : '+ Aggiungi Giudice'}
        </button>
      </div>

      {/* Add Judge Form */}
      {showAddForm && (
        <div className="p-4 bg-slate-700/50 rounded-md space-y-3">
          <input
            type="text"
            value={newJudgeName}
            onChange={e => setNewJudgeName(e.target.value)}
            placeholder="Nome completo giudice"
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            onClick={handleAddJudge}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Aggiunta...' : 'Aggiungi'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-md p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Judges List */}
      {judges.length > 0 ? (
        <div className="space-y-2">
          {judges.map(judge => (
            <div
              key={judge.id}
              className="flex items-center gap-2 p-3 bg-slate-700 rounded-md"
            >
              {editingJudgeId === judge.id ? (
                <>
                  <input
                    type="text"
                    value={editJudgeName}
                    onChange={e => setEditJudgeName(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 px-3 py-1 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleUpdateJudge(judge.id)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Salva
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-slate-600 text-white text-sm rounded hover:bg-slate-500 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-slate-200">
                    {judge.fullName}
                  </span>
                  <button
                    onClick={() => startEditing(judge)}
                    disabled={isSubmitting}
                    className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteJudge(judge.id)}
                    disabled={isSubmitting}
                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                  >
                    Elimina
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-4">
          Nessun giudice aggiunto
        </p>
      )}
    </div>
  );
};
