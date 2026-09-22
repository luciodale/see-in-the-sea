import { useState } from 'react';
import { useAdminSubmissions } from '../hooks/useAdminSubmissions';
import { useAdminUserRows } from '../hooks/useAdminUserRows';
import { useAdminUsersData } from '../hooks/useAdminUsersData';
import { useExpandedRows } from '../hooks/useExpandedRows';
import { useImageLightbox } from '../hooks/useImageLightbox';
import { exportUsersCsv } from '../utils/exportUsersCsv';
import { DocumentIcon, DownloadIcon } from './AdminIcons';
import { SubmissionLightbox } from './admin/SubmissionLightbox';
import { SubmissionsStats } from './admin/SubmissionsStats';
import { SubmissionsTable } from './admin/SubmissionsTable';
import { UsersWithoutUploadsModal } from './admin/UsersWithoutUploadsModal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

type AdminSubmissionsViewerProps = {
  contestId: string;
};

export function AdminSubmissionsViewer({
  contestId,
}: AdminSubmissionsViewerProps) {
  const [search, setSearch] = useState('');
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const { submissions, isLoading, error } = useAdminSubmissions(contestId);
  const users = useAdminUsersData(contestId);
  const {
    userRows,
    visiblePhotoCount,
    totalPhotoCount,
    usersWhoSubmitted,
    usersWhoPaid,
  } = useAdminUserRows(submissions, search);
  const { isExpanded, toggleRow } = useExpandedRows();
  const { activeSubmission, openLightbox, closeLightbox } = useImageLightbox();

  return (
    <>
      <section className="flex flex-col rounded-xl border border-border bg-background">
        <header className="flex flex-col gap-3 border-b border-border px-4 py-3">
          <SubmissionsStats
            totalUsers={users.totalUsers}
            isLoadingUsers={users.isLoading}
            usersWithoutUploadsCount={users.usersWithoutUploads.length}
            usersWhoSubmitted={usersWhoSubmitted}
            usersWhoPaid={usersWhoPaid}
            totalPhotoCount={totalPhotoCount}
            onShowUsersWithoutUploads={() => setIsUsersModalOpen(true)}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:flex-1">
              <div className="w-full sm:max-w-xs">
                <Input
                  id="search-filter"
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cerca per nome o email..."
                  aria-label="Cerca utente"
                  className="rounded-lg px-3 py-1.5 text-sm"
                />
              </div>
              {search && (
                <p className="shrink-0 text-xs text-subtle-foreground">
                  {userRows.length} utenti · {visiblePhotoCount} foto
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportUsersCsv(userRows, users.userPayments)}
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Esporta CSV
            </Button>
          </div>
        </header>

        {error && (
          <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-sm text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-foreground/70" />
            Caricamento...
          </div>
        ) : userRows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <DocumentIcon className="h-10 w-10 text-subtle-foreground" />
            <h3 className="text-sm font-medium text-foreground">
              Nessun Utente Trovato
            </h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? 'Nessun utente corrisponde alla tua ricerca.'
                : 'Nessun utente ha ancora inviato foto.'}
            </p>
          </div>
        ) : (
          <SubmissionsTable
            userRows={userRows}
            userPayments={users.userPayments}
            isExpanded={isExpanded}
            onToggleRow={toggleRow}
            onOpenImage={openLightbox}
          />
        )}
      </section>

      <UsersWithoutUploadsModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        users={users.usersWithoutUploads}
      />

      {activeSubmission && (
        <SubmissionLightbox
          submission={activeSubmission}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
