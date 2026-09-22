import type { AdminSubmission } from '../../../types/api';
import type { AdminUserRow } from '../../hooks/useAdminUserRows';
import { AdminTh } from './AdminTableCells';
import { SUBMISSIONS_TABLE_COLUMNS } from './submissionsTableColumns';
import { UserSubmissionRow } from './UserSubmissionRow';

type SubmissionsTableProps = {
  userRows: AdminUserRow[];
  userPayments: Record<string, number>;
  isExpanded: (rowId: string) => boolean;
  onToggleRow: (rowId: string) => void;
  onOpenImage: (submission: AdminSubmission) => void;
};

export function SubmissionsTable({
  userRows,
  userPayments,
  isExpanded,
  onToggleRow,
  onOpenImage,
}: SubmissionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="border-b border-border bg-surface">
          <tr>
            <AdminTh className="w-px">
              <span className="sr-only">Espandi</span>
            </AdminTh>
            {SUBMISSIONS_TABLE_COLUMNS.map(column => (
              <AdminTh key={column}>{column}</AdminTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {userRows.map(row => (
            <UserSubmissionRow
              key={row.userEmail}
              row={row}
              paymentAmount={userPayments[row.userEmail]}
              isExpanded={isExpanded(row.userEmail)}
              onToggle={onToggleRow}
              onOpenImage={onOpenImage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
