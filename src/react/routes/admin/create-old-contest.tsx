import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminPageLoader } from '../../components/admin/AdminPageLoader';
import AdminTabs from '../../components/AdminTabs';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useCreateOldContest } from '../../hooks/useCreateOldContest';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/create-old-contest')({
  component: AdminCreateOldContest,
});

function AdminCreateOldContest() {
  const navigate = useNavigate();
  const { isAdmin, isLoaded, role } = useUserRole();
  const {
    year,
    setYear,
    judgeNames,
    addJudge,
    removeJudge,
    updateJudgeName,
    isCreating,
    error,
    success,
    existingYears,
    isLoadingYears,
    handleCreateContest,
    resetForm,
  } = useCreateOldContest();

  if (!isLoaded) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="text-slate-100">
            <AdminTabs />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Gestisci Concorso Passato
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Aggiungi un concorso per un anno precedente al sistema.
                  </p>
                </div>

                {isLoadingYears ? (
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mr-2" />
                      <span className="text-slate-300 text-sm">
                        Caricamento anni esistenti...
                      </span>
                    </div>
                  </div>
                ) : existingYears.length > 0 ? (
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <h3 className="text-sm font-medium text-slate-200 mb-2">
                      Concorsi Esistenti:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {existingYears.map(existingYear => {
                        const currentYear = new Date().getFullYear();
                        const isFutureOrCurrent = existingYear >= currentYear;

                        return (
                          <button
                            key={existingYear}
                            type="button"
                            onClick={() =>
                              !isFutureOrCurrent &&
                              navigate({ to: `/admin/contest/${existingYear}` })
                            }
                            disabled={isFutureOrCurrent}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                              isFutureOrCurrent
                                ? 'bg-slate-600 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white cursor-pointer'
                            }`}
                            title={
                              isFutureOrCurrent
                                ? 'Non puoi modificare concorsi attuali o futuri'
                                : `Gestisci concorso ${existingYear}`
                            }
                          >
                            {existingYear}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleCreateContest();
                    }}
                    className="space-y-6"
                  >
                    <div>
                      <label
                        htmlFor="year"
                        className="block text-sm font-medium text-slate-200 mb-2"
                      >
                        Anno del Concorso
                      </label>
                      <input
                        id="year"
                        type="number"
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        placeholder="es. 2023"
                        disabled={isCreating}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="mt-2 text-sm text-slate-400">
                        Inserisci l'anno del concorso passato (non può essere
                        l'anno corrente o futuro)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Giudici (Opzionale)
                      </label>
                      <div className="space-y-2">
                        {judgeNames.map((name, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={name}
                              onChange={e =>
                                updateJudgeName(index, e.target.value)
                              }
                              placeholder={`Nome giudice ${index + 1}`}
                              disabled={isCreating}
                              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {judgeNames.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeJudge(index)}
                                disabled={isCreating}
                                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addJudge}
                        disabled={isCreating}
                        className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Aggiungi Giudice
                      </button>
                    </div>

                    {error && (
                      <div className="bg-red-900/40 border border-red-700 rounded-md p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="text-red-400 text-xl">
                              &#9888;&#65039;
                            </span>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-200">
                              Errore
                            </h3>
                            <p className="mt-1 text-sm text-red-300">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div className="bg-emerald-900/40 border border-emerald-700 rounded-md p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="text-emerald-400 text-xl">
                              &#10003;
                            </span>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-emerald-200">
                              Successo
                            </h3>
                            <p className="mt-1 text-sm text-emerald-300">
                              Concorso uw-{year} creato con successo!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isCreating || !year || success}
                        className="flex-1 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isCreating ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Creazione in corso...
                          </span>
                        ) : (
                          'Crea Concorso'
                        )}
                      </button>

                      {success && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-2.5 bg-slate-700 text-white font-medium rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
                        >
                          Crea Altro
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>
        ) : (
          <AdminAccessDenied role={role} />
        )}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
