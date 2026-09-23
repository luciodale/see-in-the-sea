import {
  Check,
  ImageOff,
  Images,
  ImageUp,
  Pencil,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { IMAGES_BASE_URL } from '../../constants';
import type { Judge } from '../../types/api';
import { useJudgeManager } from '../hooks/useJudgeManager';
import { JudgeLibraryPicker } from './JudgeLibraryPicker';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

type JudgeAvatarProps = {
  judge: Judge;
  isUploading: boolean;
};

function JudgeAvatar({ judge, isUploading }: JudgeAvatarProps) {
  return (
    <div className="relative shrink-0">
      {judge.r2ImageId ? (
        <img
          src={`${IMAGES_BASE_URL}/${judge.r2ImageId}`}
          alt={judge.fullName}
          loading="lazy"
          className="size-12 rounded-full border border-border object-cover"
        />
      ) : (
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-surface-raised">
          <User className="size-6 text-subtle-foreground" />
        </div>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
          <div className="size-5 animate-spin rounded-full border-b-2 border-foreground/70" />
        </div>
      )}
    </div>
  );
}

type JudgeManagerProps = {
  contestId: string;
  judges: Judge[];
  onUpdate: () => void;
};

export function JudgeManager({
  contestId,
  judges,
  onUpdate,
}: JudgeManagerProps) {
  const {
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
  } = useJudgeManager({ contestId, onUpdate });

  const isReassigning = libraryTarget?.mode === 'reassign';

  return (
    <>
      <section className="flex flex-col rounded-xl border border-border bg-background">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />

        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-col gap-1">
            <p className="text-editorial uppercase tracking-editorial text-subtle-foreground">
              Giudici
            </p>
            <p className="text-sm text-muted-foreground">
              {judges.length === 1 ? '1 giudice' : `${judges.length} giudici`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="min-h-11"
              onClick={openLibraryForNewJudge}
              disabled={isSubmitting}
            >
              <Images className="size-3.5" />
              Dalla libreria
            </Button>
            <Button
              size="sm"
              className="min-h-11"
              onClick={toggleAddForm}
              disabled={isSubmitting}
            >
              {isAddFormOpen ? (
                <X className="size-3.5" />
              ) : (
                <UserPlus className="size-3.5" />
              )}
              {isAddFormOpen ? 'Annulla' : 'Aggiungi giudice'}
            </Button>
          </div>
        </header>

        {isAddFormOpen && (
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-end">
            <div className="sm:flex-1">
              <Input
                id="new-judge-name"
                label="Nome completo"
                value={newJudgeName}
                onChange={e => setNewJudgeName(e.target.value)}
                placeholder="Nome completo giudice"
                disabled={isSubmitting}
                className="min-h-11 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <Button
              size="sm"
              className="min-h-11 sm:shrink-0"
              onClick={handleAddJudge}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Aggiunta...' : 'Aggiungi'}
            </Button>
          </div>
        )}

        {error && (
          <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {judges.length > 0 ? (
          <ul className="flex flex-col">
            {judges.map(judge => {
              const isUploading = uploadingJudgeId === judge.id;
              const isPhotoBusy = isSubmitting || isUploading;

              return (
                <li
                  key={judge.id}
                  className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <JudgeAvatar judge={judge} isUploading={isUploading} />

                  {editingJudgeId === judge.id ? (
                    <>
                      <div className="min-w-40 flex-1">
                        <Input
                          id={`judge-name-${judge.id}`}
                          value={editJudgeName}
                          onChange={e => setEditJudgeName(e.target.value)}
                          aria-label="Nome giudice"
                          disabled={isSubmitting}
                          className="min-h-11 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="min-h-11"
                          onClick={() => handleUpdateJudge(judge.id)}
                          loading={isSubmitting}
                        >
                          <Check className="size-3.5" />
                          Salva
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="min-h-11"
                          onClick={cancelEditing}
                          disabled={isSubmitting}
                        >
                          <X className="size-3.5" />
                          Annulla
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="min-w-40 flex-1 text-sm text-foreground">
                        {judge.fullName}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-11"
                          onClick={() => triggerImageUpload(judge.id)}
                          disabled={isPhotoBusy}
                          title="Carica foto"
                        >
                          <ImageUp className="size-3.5" />
                          {judge.r2ImageId ? 'Cambia foto' : 'Aggiungi foto'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-11"
                          onClick={() => openLibraryForJudge(judge)}
                          disabled={isPhotoBusy}
                        >
                          <Images className="size-3.5" />
                          Dalla libreria
                        </Button>
                        {judge.r2ImageId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-11 text-warning hover:bg-warning/10 hover:text-warning"
                            onClick={() => handleDeleteImage(judge.id)}
                            disabled={isPhotoBusy}
                          >
                            <ImageOff className="size-3.5" />
                            Rimuovi foto
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-11"
                          onClick={() => startEditing(judge)}
                          disabled={isSubmitting}
                        >
                          <Pencil className="size-3.5" />
                          Modifica
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteJudge(judge.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="size-3.5" />
                          Elimina
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <Users className="size-10 text-subtle-foreground" />
            <p className="text-sm text-muted-foreground">
              Nessun giudice aggiunto
            </p>
          </div>
        )}
      </section>

      <JudgeLibraryPicker
        isOpen={libraryTarget !== null}
        onClose={closeLibrary}
        onSelect={handleLibrarySelect}
        busyR2ImageId={libraryBusyR2ImageId}
        refreshKey={libraryRefreshKey}
        excludeR2ImageId={
          isReassigning ? libraryTarget.judge.r2ImageId : undefined
        }
        helperText={
          isReassigning
            ? `Foto per ${libraryTarget.judge.fullName}`
            : 'Riutilizza la foto di un giudice esistente'
        }
      />
    </>
  );
}
