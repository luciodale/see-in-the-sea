import type { AdminUserRow } from '../hooks/useAdminUserRows';

const CSV_HEADERS = [
  'Nome',
  'Cognome',
  'Email',
  'Pagamento',
  'Registrato',
  'Ultima Attività',
  '# Foto',
  'Importo Pagato',
];

function toCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportUsersCsv(
  userRows: AdminUserRow[],
  userPayments: Record<string, number>
) {
  const rows = userRows.map(row => {
    const payment = userPayments[row.userEmail];
    return [
      row.firstName || '',
      row.lastName || '',
      row.userEmail,
      row.hasPaid ? 'Pagato' : 'Non Pagato',
      row.userCreatedAt || '',
      row.userLastActiveAt || '',
      row.submissions.length.toString(),
      payment ? (payment / 100).toFixed(2) : '',
    ];
  });

  const csvContent = [
    CSV_HEADERS.join(';'),
    ...rows.map(row => row.map(toCsvCell).join(';')),
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `concorso-corrente-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
