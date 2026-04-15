import { useAuth } from '@clerk/clerk-react';
import { useRef, useState } from 'react';
import { IMAGES_BASE_URL } from '../../constants';
import type {
  ApiResponse,
  CreateJudgeResponse,
  DeleteJudgeResponse,
  Judge,
  JudgeLibraryItem,
  UpdateJudgeResponse,
} from '../../types/api';
import { JudgeLibraryPicker } from './JudgeLibraryPicker';

interface JudgeManagerProps {
  contestId: string;
  judges: Judge[];
  onUpdate: () => void;
}

export function JudgeManager({
  contestId,
  judges,
  onUpdate,
}: JudgeManagerProps) {
  const { getToken } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [editingJudgeId, setEditingJudgeId] = useState<string | null>(null);
  const [editJudgeName, setEditJudgeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingJudgeId, setUploadingJudgeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [addingFromLibrary, setAddingFromLibrary] = useState<string | null>(
    null
  );
  // Per-row library picker: which judge is picking a library photo
  const [pickerForJudgeId, setPickerForJudgeId] = useState<string | null>(null);
  const [reassigningR2ImageId, setReassigningR2ImageId] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingJudgeIdRef = useRef<string | null>(null);

  function handleAddJudge() {
    if (!newJudgeName.trim()) {
      setError('Il nome del giudice è obbligatorio');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    getToken()
      .then(token =>
        fetch('/api/admin/contest-judges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contestId, fullName: newJudgeName.trim() }),
        })
      )
      .then(async response => {
        const result: CreateJudgeResponse = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Errore durante l'aggiunta");
        setNewJudgeName('');
        setShowAddForm(false);
        onUpdate();
      })
      .catch(err => {
        console.error('Error adding judge:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleToggleLibrary() {
    // Opening the library closes the new-judge form and vice versa so only
    // one add-affordance is visible at a time. Picker fetches its own data.
    if (showLibrary) {
      setShowLibrary(false);
      return;
    }
    setShowAddForm(false);
    setShowLibrary(true);
    setError(null);
  }

  function handleAddFromLibrary(item: JudgeLibraryItem) {
    setAddingFromLibrary(item.r2ImageId);
    setError(null);

    getToken()
      .then(token =>
        fetch('/api/admin/contest-judges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contestId,
            fullName: item.fullName,
            r2ImageId: item.r2ImageId,
          }),
        })
      )
      .then(async response => {
        const result: CreateJudgeResponse = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Errore durante l'aggiunta");
        setShowLibrary(false);
        onUpdate();
      })
      .catch(err => {
        console.error('Error adding judge from library:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => setAddingFromLibrary(null));
  }

  function handleReassignFromLibrary(
    judge: Judge,
    item: JudgeLibraryItem
  ) {
    setReassigningR2ImageId(item.r2ImageId);
    setError(null);

    getToken()
      .then(token =>
        fetch('/api/admin/contest-judges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            judgeId: judge.id,
            fullName: judge.fullName,
            r2ImageId: item.r2ImageId,
          }),
        })
      )
      .then(async response => {
        const result: UpdateJudgeResponse = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Errore durante l'aggiornamento");
        setPickerForJudgeId(null);
        onUpdate();
      })
      .catch(err => {
        console.error('Error reassigning judge photo:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => setReassigningR2ImageId(null));
  }

  function handleUpdateJudge(judgeId: string) {
    if (!editJudgeName.trim()) {
      setError('Il nome del giudice è obbligatorio');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    getToken()
      .then(token =>
        fetch('/api/admin/contest-judges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ judgeId, fullName: editJudgeName.trim() }),
        })
      )
      .then(async response => {
        const result: UpdateJudgeResponse = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Errore durante l'aggiornamento");
        setEditingJudgeId(null);
        setEditJudgeName('');
        onUpdate();
      })
      .catch(err => {
        console.error('Error updating judge:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleDeleteJudge(judgeId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo giudice?')) return;

    setIsSubmitting(true);
    setError(null);

    getToken()
      .then(token =>
        fetch(`/api/admin/contest-judges?judgeId=${judgeId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then(async response => {
        const result: DeleteJudgeResponse = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Errore durante l'eliminazione");
        onUpdate();
      })
      .catch(err => {
        console.error('Error deleting judge:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => setIsSubmitting(false));
  }

  function triggerImageUpload(judgeId: string) {
    pendingJudgeIdRef.current = judgeId;
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const judgeId = pendingJudgeIdRef.current;
    if (!file || !judgeId) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    setUploadingJudgeId(judgeId);
    setError(null);

    getToken()
      .then(token => {
        const formData = new FormData();
        formData.append('judgeId', judgeId);
        formData.append('image', file);
        return fetch('/api/admin/judge-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      })
      .then(async response => {
        const result: ApiResponse<{ r2ImageId: string }> =
          await response.json();
        if (!response.ok)
          throw new Error(result.message || 'Errore upload immagine');
        onUpdate();
      })
      .catch(err => {
        console.error('Error uploading judge image:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => {
        setUploadingJudgeId(null);
        pendingJudgeIdRef.current = null;
      });
  }

  function handleDeleteImage(judgeId: string) {
    if (!confirm("Sei sicuro di voler eliminare l'immagine?")) return;

    setUploadingJudgeId(judgeId);
    setError(null);

    getToken()
      .then(token =>
        fetch(`/api/admin/judge-image?judgeId=${judgeId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then(async response => {
        const result: ApiResponse<object> = await response.json();
        if (!response.ok)
          throw new Error(result.message || 'Errore eliminazione immagine');
        onUpdate();
      })
      .catch(err => {
        console.error('Error deleting judge image:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      })
      .finally(() => setUploadingJudgeId(null));
  }

  function startEditing(judge: Judge) {
    setEditingJudgeId(judge.id);
    setEditJudgeName(judge.fullName);
  }

  function cancelEditing() {
    setEditingJudgeId(null);
    setEditJudgeName('');
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Add Judge Buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-semibold text-white">Giudici</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleToggleLibrary}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-600 text-white text-sm rounded-md hover:bg-slate-500 transition-colors disabled:opacity-50"
          >
            {showLibrary ? 'Annulla libreria' : 'Da libreria'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) setShowLibrary(false);
            }}
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {showAddForm ? 'Annulla' : '+ Aggiungi Giudice'}
          </button>
        </div>
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
            type="button"
            onClick={handleAddJudge}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Aggiunta...' : 'Aggiungi'}
          </button>
        </div>
      )}

      {/* Library Picker (for adding a new judge) */}
      {showLibrary && (
        <div className="p-4 bg-slate-700/50 rounded-md">
          <JudgeLibraryPicker
            onSelect={handleAddFromLibrary}
            busyR2ImageId={addingFromLibrary}
            helperText="Seleziona un giudice esistente per riutilizzarne la foto."
          />
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
            <div key={judge.id} className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-md flex-wrap">
              {/* Judge Image */}
              <div className="relative shrink-0">
                {judge.r2ImageId ? (
                  <img
                    src={`${IMAGES_BASE_URL}/${judge.r2ImageId}`}
                    alt={judge.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center border border-slate-500">
                    <svg
                      className="w-6 h-6 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                {uploadingJudgeId === judge.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>

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
                    type="button"
                    onClick={() => handleUpdateJudge(judge.id)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Salva
                  </button>
                  <button
                    type="button"
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
                    type="button"
                    onClick={() => triggerImageUpload(judge.id)}
                    disabled={isSubmitting || uploadingJudgeId === judge.id}
                    className="text-accent-hover hover:underline text-sm disabled:opacity-50"
                    title="Carica foto"
                  >
                    {judge.r2ImageId ? 'Cambia foto' : 'Aggiungi foto'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPickerForJudgeId(
                        pickerForJudgeId === judge.id ? null : judge.id
                      )
                    }
                    disabled={isSubmitting || uploadingJudgeId === judge.id}
                    className="text-accent-hover hover:underline text-sm disabled:opacity-50"
                  >
                    {pickerForJudgeId === judge.id
                      ? 'Chiudi libreria'
                      : 'Da libreria'}
                  </button>
                  {judge.r2ImageId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(judge.id)}
                      disabled={isSubmitting || uploadingJudgeId === judge.id}
                      className="text-orange-400 hover:text-orange-300 text-sm disabled:opacity-50"
                    >
                      Rimuovi foto
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEditing(judge)}
                    disabled={isSubmitting}
                    className="text-accent-hover hover:underline text-sm disabled:opacity-50"
                  >
                    Modifica
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteJudge(judge.id)}
                    disabled={isSubmitting}
                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                  >
                    Elimina
                  </button>
                </>
              )}
              </div>
              {pickerForJudgeId === judge.id && (
                <div className="p-4 bg-slate-700/50 rounded-md">
                  <JudgeLibraryPicker
                    onSelect={item => handleReassignFromLibrary(judge, item)}
                    busyR2ImageId={reassigningR2ImageId}
                    excludeR2ImageId={judge.r2ImageId ?? undefined}
                    helperText={`Scegli una foto per ${judge.fullName}`}
                  />
                </div>
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
}
