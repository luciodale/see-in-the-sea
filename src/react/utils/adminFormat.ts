export function formatAdminDate(dateString: string | null | undefined) {
  if (!dateString) return '—';
  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) return '—';
  return new Date(parsed).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAmount(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export function formatPercent(part: number, total: number) {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : '0%';
}

export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

export function formatPortfolioPhotoType(photoType: string) {
  return photoType.replaceAll('-', ' ');
}
