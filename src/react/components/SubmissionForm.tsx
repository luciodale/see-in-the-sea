import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';

interface OldContestSubmissionFormProps {
  contestId: string;
  submissionId?: string;
  initialData?: {
    categoryName: string;
    firstName: string;
    lastName: string;
    title: string;
    description: string;
    resultPlacement: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const OldContestSubmissionForm = ({
  contestId,
  submissionId,
  initialData,
  onSuccess,
  onCancel,
}: OldContestSubmissionFormProps) => {
  const { getToken } = useAuth();
  const isEdit = !!submissionId;

  const [categoryName, setCategoryName] = useState(
    initialData?.categoryName || ''
  );
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [resultPlacement, setResultPlacement] = useState(
    initialData?.resultPlacement || 'first'
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!categoryName || !firstName || !lastName || !title) {
      setError('Tutti i campi obbligatori devono essere compilati');
      return;
    }

    if (!isEdit && !imageFile) {
      setError("L'immagine è obbligatoria per nuove submission");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('contestId', contestId);
      formData.append('categoryName', categoryName);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('title', title);
      if (description) formData.append('description', description);
      formData.append('resultPlacement', resultPlacement);
      formData.append('isEdit', isEdit ? 'true' : 'false');
      if (submissionId) formData.append('submissionId', submissionId);
      if (imageFile) formData.append('image', imageFile);

      const token = await getToken();
      const response = await fetch('/api/admin/old-contest-submission', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Errore durante il salvataggio');
      }

      onSuccess();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Categoria *
        </label>
        <input
          type="text"
          value={categoryName}
          onChange={e => setCategoryName(e.target.value)}
          disabled={isSubmitting}
          placeholder="es. Macro, Wide Angle"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
      </div>

      {/* First Name */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Nome *
        </label>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Cognome *
        </label>
        <input
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Titolo *
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Descrizione
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
      </div>

      {/* Result Placement */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Piazzamento *
        </label>
        <select
          value={resultPlacement}
          onChange={e => setResultPlacement(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          <option value="first">Primo</option>
          <option value="second">Secondo</option>
          <option value="third">Terzo</option>
          <option value="runner-up">Menzione</option>
        </select>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Immagine {!isEdit && '*'}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files?.[0] || null)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer hover:file:bg-emerald-700 disabled:opacity-50"
        />
        {isEdit && (
          <p className="mt-1 text-xs text-slate-400">
            Lascia vuoto per mantenere l'immagine esistente
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-md p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Salvataggio...' : isEdit ? 'Aggiorna' : 'Crea'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-700 text-white font-medium rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Annulla
        </button>
      </div>
    </form>
  );
};
