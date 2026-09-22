type AdminAccessDeniedProps = {
  role?: string | null;
};

export function AdminAccessDenied({ role }: AdminAccessDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-3">&#128683;</div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Accesso Negato
        </h2>
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
