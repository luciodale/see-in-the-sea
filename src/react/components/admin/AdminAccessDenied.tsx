import { Ban } from 'lucide-react';

type AdminAccessDeniedProps = {
  role?: string | null;
};

export function AdminAccessDenied({ role }: AdminAccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <Ban className="size-10 text-subtle-foreground" />
        <h2 className="text-lg font-medium text-foreground">Accesso Negato</h2>
        {role && (
          <p className="text-sm text-muted-foreground">
            Ruolo attuale:{' '}
            <span className="font-medium text-foreground">{role}</span>
          </p>
        )}
      </div>
    </div>
  );
}
