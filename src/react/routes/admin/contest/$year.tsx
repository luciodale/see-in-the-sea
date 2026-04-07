import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import AdminTabs from '@/react/components/AdminTabs';
import { AdminAccessDenied } from '@/react/components/admin/AdminAccessDenied';
import { AdminPageLoader } from '@/react/components/admin/AdminPageLoader';
import { JudgeManager } from '@/react/components/JudgeManager';
import { OldContestSubmissionForm } from '@/react/components/OldContestSubmissionForm';
import { RedirectToSignIn } from '@/react/components/RedirectToSignIn';
import { useContestManagement } from '@/react/hooks/useContestManagement';
import { useUserRole } from '@/react/hooks/useUserRole';
import { getFullQualityImageUrl } from '@/server/imageService';
import type { DeleteSubmissionResponse } from '@/types/api';

export const Route = createFileRoute('/admin/contest/$year')({
  component: ContestManagementPage,
});

function ContestManagementPage() {
  const { year } = Route.useParams();
  const yearNum = parseInt(year, 10);
  const { getToken } = useAuth();
  const { isAdmin, isLoaded, role } = useUserRole();
  const { data, isLoading, error, refreshData } = useContestManagement(yearNum);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<{
    id: string;
    data: {
      categoryId: string;
      firstName: string;
      lastName: string;
      title: string;
      description: string;
      resultPlacement: string;
    };
  } | null>(null);
  const [deletingSubmissionId, setDeletingSubmissionId] = useState<
    string | null
  >(null);

  // Ref for the form container to scroll to
  const formContainerRef = useRef<HTMLDivElement>(null);

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa submission?')) {
      return;
    }

    try {
      setDeletingSubmissionId(submissionId);

      const token = await getToken();
      const response = await fetch(
        `/api/admin/delete-old-contest-submission?submissionId=${submissionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: DeleteSubmissionResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Errore durante l'eliminazione");
      }

      refreshData();
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setDeletingSubmissionId(null);
    }
  };

  const handleEditSubmission = (submission: {
    id: string;
    categoryId: string;
    title: string;
    description: string | null;
    result: {
      result: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
    category: { name: string } | null;
  }) => {
    setEditingSubmission({
      id: submission.id,
      data: {
        categoryId: submission.categoryId,
        firstName: submission.result?.firstName || '',
        lastName: submission.result?.lastName || '',
        title: submission.title,
        description: submission.description || '',
        resultPlacement: submission.result?.result || 'first',
      },
    });
    setShowAddSubmission(false);

    // Scroll to form
    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  if (!isLoaded || isLoading) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="text-slate-100">
            <AdminTabs />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Gestione Concorso {year}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {data?.contest.name || `UW Contest ${year}`}
                  </p>
                </div>

                {error ? (
                  <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-400 text-4xl mb-2">❌</div>
                    <h2 className="text-xl font-bold mb-2">Errore</h2>
                    <p>{error}</p>
                  </div>
                ) : data ? (
                  <>
                    {/* Judges Section */}
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                      <JudgeManager
                        contestId={data.contest.id}
                        judges={data.judges}
                        onUpdate={refreshData}
                      />
                    </div>

                    {/* Submissions/Results Section */}
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          Risultati
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSubmission(!showAddSubmission);
                            setEditingSubmission(null);
                            // Scroll to form when opening
                            if (!showAddSubmission) {
                              setTimeout(() => {
                                formContainerRef.current?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'start',
                                });
                              }, 100);
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors"
                        >
                          {showAddSubmission
                            ? 'Annulla'
                            : '+ Aggiungi Risultato'}
                        </button>
                      </div>

                      {(showAddSubmission || editingSubmission) && (
                        <div
                          ref={formContainerRef}
                          className="mb-6 p-6 bg-slate-700/50 rounded-md"
                        >
                          <h4 className="text-lg font-medium text-white mb-4">
                            {editingSubmission
                              ? 'Modifica Submission'
                              : 'Nuova Submission'}
                          </h4>
                          <OldContestSubmissionForm
                            contestId={data.contest.id}
                            submissionId={editingSubmission?.id}
                            initialData={editingSubmission?.data}
                            onSuccess={() => {
                              setShowAddSubmission(false);
                              setEditingSubmission(null);
                              refreshData();
                            }}
                            onCancel={() => {
                              setShowAddSubmission(false);
                              setEditingSubmission(null);
                            }}
                          />
                        </div>
                      )}

                      {data.submissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.submissions.map(submission => (
                            <div
                              key={submission.id}
                              className="bg-slate-700 rounded-lg overflow-hidden"
                            >
                              {submission.r2ImageId && (
                                <div className="aspect-video bg-slate-600 overflow-hidden">
                                  <img
                                    src={
                                      submission.r2ImageId
                                        ? getFullQualityImageUrl(
                                            submission.r2ImageId
                                          )
                                        : ''
                                    }
                                    alt={submission.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-white">
                                      {submission.title}
                                    </h4>
                                    {submission.category && (
                                      <p className="text-sm text-slate-400">
                                        {submission.category.name}
                                      </p>
                                    )}
                                  </div>
                                  {submission.result && (
                                    <span className="px-2 py-1 text-xs bg-emerald-600 text-white rounded">
                                      {submission.result.result}
                                    </span>
                                  )}
                                </div>
                                {submission.result && (
                                  <p className="text-sm text-slate-300">
                                    {submission.result.firstName}{' '}
                                    {submission.result.lastName}
                                  </p>
                                )}
                                <div className="flex gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditSubmission(submission)
                                    }
                                    disabled={
                                      deletingSubmissionId === submission.id
                                    }
                                    className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
                                  >
                                    Modifica
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteSubmission(submission.id)
                                    }
                                    disabled={
                                      deletingSubmissionId === submission.id
                                    }
                                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                                  >
                                    {deletingSubmissionId === submission.id
                                      ? 'Eliminazione...'
                                      : 'Elimina'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">
                          Nessun risultato aggiunto
                        </p>
                      )}
                    </div>
                  </>
                ) : null}
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
