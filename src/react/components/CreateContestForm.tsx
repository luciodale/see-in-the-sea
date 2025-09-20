import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import type {
  CreateContestFormData,
  CreateContestResponse,
} from '../../types/api';

type CreateContestFormProps = {
  onSuccess?: (contestId: string) => void;
  onCancel?: () => void;
};

export default function CreateContestForm({
  onSuccess,
  onCancel,
}: CreateContestFormProps) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState<CreateContestFormData>({
    id: '',
    name: '',
    description: '',
    year: new Date().getFullYear(),
    maxSubmissionsPerCategory: 2,
    // default to inactive, admin can toggle after creation (status field below)
    status: 'inactive',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Get JWT token for authentication
      const token = await getToken();
      if (!token) {
        throw new Error('Token di autenticazione non disponibile');
      }

      // Validate form data
      if (!formData.id.trim()) {
        throw new Error('ID del concorso richiesto');
      }
      if (!formData.name.trim()) {
        throw new Error('Nome del concorso richiesto');
      }
      if (!formData.year || Number.isNaN(Number(formData.year))) {
        throw new Error('Anno richiesto');
      }

      // Submit to API
      const response = await fetch('/api/admin/manage-contest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as CreateContestResponse;

      if (!response.ok) {
        throw new Error(result.message || 'Impossibile creare il concorso');
      }

      setSuccess('Concorso creato con successo! 🎉');

      // Reset form
      setFormData({
        id: '',
        name: '',
        description: '',
        year: new Date().getFullYear(),
        maxSubmissionsPerCategory: 2,
        status: 'inactive',
      });

      // Call success callback
      if (onSuccess && result.data?.contestId) {
        onSuccess(result.data.contestId);
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Si è verificato un errore imprevisto'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // No dates; use year only

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🏆 Crea Nuovo Concorso
        </h2>
        <p className="text-slate-300">
          Configura un nuovo concorso di fotografia subacquea con tutti i
          dettagli.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-md">
          <p className="text-red-200 text-sm">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-emerald-900/30 border border-emerald-700 rounded-md">
          <p className="text-emerald-200 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contest ID */}
        <div>
          <label
            htmlFor="id"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            ID Concorso *
          </label>
          <input
            id="id"
            name="id"
            type="text"
            required
            value={formData.id}
            onChange={handleInputChange}
            placeholder="e.g., uw-2025, contest-spring-2025"
            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Identificatore univoco per il concorso (usato negli URL e nel
            database)
          </p>
        </div>

        {/* Contest Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            Nome Concorso *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Underwater Photography Contest 2025"
            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            Descrizione
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descrivi il tema del concorso, le regole o le istruzioni speciali..."
            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Year */}
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-slate-2 00 mb-2"
          >
            Anno *
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            value={formData.year}
            onChange={handleInputChange}
            min={1900}
            max={2100}
            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="maxSubmissionsPerCategory"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Max Invia per Categoria
            </label>
            <select
              id="maxSubmissionsPerCategory"
              name="maxSubmissionsPerCategory"
              value={formData.maxSubmissionsPerCategory}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={1}>1 invia</option>
              <option value={2}>2 invia</option>
              <option value={3}>3 invia</option>
              <option value={5}>5 invia</option>
              <option value={10}>10 invia</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Stato Concorso
            </label>
            <select
              id="status"
              name="status"
              value={formData.status || 'inactive'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
            >
              <option value="active">active</option>
              <option value="assessment">assessment</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creazione Concorso...
              </span>
            ) : (
              '🏆 Crea Concorso'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-slate-700 text-slate-200 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              Annulla
            </button>
          )}
        </div>
      </form>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-md">
        <p className="text-slate-300 text-sm">
          <strong>💡 Suggerimento:</strong> Una volta creato, il concorso
          apparirà nell'interfaccia utente. Assicurati che anno e limiti di
          invia siano corretti prima di creare.
        </p>
      </div>
    </div>
  );
}
