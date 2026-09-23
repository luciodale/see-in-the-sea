import { useAuth } from '@clerk/clerk-react';
import { useRef, useState } from 'react';
import type {
  ApiResponse,
  CreateJudgeResponse,
  DeleteJudgeResponse,
  Judge,
  JudgeLibraryItem,
  UpdateJudgeResponse,
} from '../../types/api';

/**
 * The library modal is shared: it either adds a brand new judge from an
 * existing photo, or reassigns the photo of the judge it was opened from.
 */
export type JudgeLibraryTarget =
  | { mode: 'add' }
  | { mode: 'reassign'; judge: Judge };

type UseJudgeManagerArgs = {
  contestId: string;
  onUpdate: () => void;
};

const UNEXPECTED_ERROR = 'Errore imprevisto';

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useJudgeManager({ contestId, onUpdate }: UseJudgeManagerArgs) {
  const { getToken } = useAuth();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [editingJudgeId, setEditingJudgeId] = useState<string | null>(null);
  const [editJudgeName, setEditJudgeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingJudgeId, setUploadingJudgeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libraryTarget, setLibraryTarget] = useState<JudgeLibraryTarget | null>(
    null
  );
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
  const [libraryBusyR2ImageId, setLibraryBusyR2ImageId] = useState<
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
        setIsAddFormOpen(false);
        onUpdate();
      })
      .catch(err => {
        console.error('Error adding judge:', err);
        setError(toMessage(err, UNEXPECTED_ERROR));
      })
      .finally(() => setIsSubmitting(false));
  }

  function toggleAddForm() {
    setIsAddFormOpen(current => !current);
  }

  function openLibraryForNewJudge() {
    // Opening the library closes the new-judge form so only one
    // add-affordance is active at a time.
    setIsAddFormOpen(false);
    setError(null);
    setLibraryTarget({ mode: 'add' });
  }

  function openLibraryForJudge(judge: Judge) {
    setError(null);
    setLibraryTarget({ mode: 'reassign', judge });
  }

  function closeLibrary() {
    setLibraryTarget(null);
  }

  function addFromLibrary(item: JudgeLibraryItem) {
    setLibraryBusyR2ImageId(item.r2ImageId);
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
        onUpdate();
      })
      .catch(err => {
        console.error('Error adding judge from library:', err);
        setError(toMessage(err, UNEXPECTED_ERROR));
      })
      .finally(() => {
        // Stay open: adding several judges in a row is the common case
        setLibraryBusyR2ImageId(null);
      });
  }

  function reassignFromLibrary(judge: Judge, item: JudgeLibraryItem) {
    setLibraryBusyR2ImageId(item.r2ImageId);
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
        onUpdate();
      })
      .catch(err => {
        console.error('Error reassigning judge photo:', err);
        setError(toMessage(err, UNEXPECTED_ERROR));
      })
      .finally(() => {
        setLibraryBusyR2ImageId(null);
        setLibraryTarget(null);
      });
  }

  function handleLibrarySelect(item: JudgeLibraryItem) {
    if (!libraryTarget) return;
    if (libraryTarget.mode === 'add') {
      addFromLibrary(item);
      return;
    }
    reassignFromLibrary(libraryTarget.judge, item);
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
        setError(toMessage(err, UNEXPECTED_ERROR));
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
        setError(toMessage(err, UNEXPECTED_ERROR));
      })
      .finally(() => setIsSubmitting(false));
  }

  function triggerImageUpload(judgeId: string) {
    pendingJudgeIdRef.current = judgeId;
    fileInputRef.current?.click();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const judgeId = pendingJudgeIdRef.current;
    if (!file || !judgeId) return;

    // Reset input so the same file can be re-selected
    event.target.value = '';

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
        setLibraryRefreshKey(key => key + 1);
      })
      .catch(err => {
        console.error('Error uploading judge image:', err);
        setError(toMessage(err, UNEXPECTED_ERROR));
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
        setLibraryRefreshKey(key => key + 1);
      })
      .catch(err => {
        console.error('Error deleting judge image:', err);
        setError(toMessage(err, UNEXPECTED_ERROR));
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

  return {
    fileInputRef,
    isAddFormOpen,
    toggleAddForm,
    newJudgeName,
    setNewJudgeName,
    handleAddJudge,
    editingJudgeId,
    editJudgeName,
    setEditJudgeName,
    startEditing,
    cancelEditing,
    handleUpdateJudge,
    handleDeleteJudge,
    isSubmitting,
    uploadingJudgeId,
    error,
    libraryTarget,
    libraryBusyR2ImageId,
    libraryRefreshKey,
    openLibraryForNewJudge,
    openLibraryForJudge,
    closeLibrary,
    handleLibrarySelect,
    triggerImageUpload,
    handleFileSelected,
    handleDeleteImage,
  };
}
