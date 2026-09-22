import type { AdminSubmission } from '../../../types/api';
import type { AdminUserRow } from '../../hooks/useAdminUserRows';
import {
  formatAdminDate,
  formatAmount,
  formatFullName,
} from '../../utils/adminFormat';
import { ChevronRightIcon } from '../AdminIcons';
import { Badge } from '../ui/Badge';
import { cn } from '../ui/cn';
import { AdminTd } from './AdminTableCells';
import { SubmissionDetailRow } from './SubmissionDetailRow';
import { SUBMISSIONS_TABLE_COLUMN_COUNT } from './submissionsTableColumns';

type UserSubmissionRowProps = {
  row: AdminUserRow;
  paymentAmount: number | undefined;
  isExpanded: boolean;
  onToggle: (rowId: string) => void;
  onOpenImage: (submission: AdminSubmission) => void;
};

export function UserSubmissionRow({
  row,
  paymentAmount,
  isExpanded,
  onToggle,
  onOpenImage,
}: UserSubmissionRowProps) {
  const fullName = formatFullName(row.firstName, row.lastName);
  const detailsId = `submissions-${row.userEmail}`;

  return (
    <>
      <tr className="border-b border-border transition-colors hover:bg-surface">
        <AdminTd>
          <button
            type="button"
            onClick={() => onToggle(row.userEmail)}
            aria-expanded={isExpanded}
            aria-controls={isExpanded ? detailsId : undefined}
            aria-label={`${isExpanded ? 'Nascondi' : 'Mostra'} foto di ${fullName || row.userEmail}`}
            className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors cursor-pointer hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRightIcon
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        </AdminTd>
        <AdminTd className="text-sm font-medium text-foreground">
          {fullName || <span className="text-subtle-foreground">—</span>}
        </AdminTd>
        <AdminTd className="text-sm text-muted-foreground">
          {row.userEmail}
        </AdminTd>
        <AdminTd>
          {row.hasPaid ? (
            <Badge variant="success">Pagato</Badge>
          ) : (
            <Badge variant="danger">Non pagato</Badge>
          )}
        </AdminTd>
        <AdminTd className="text-xs tabular-nums text-muted-foreground">
          {formatAdminDate(row.userCreatedAt)}
        </AdminTd>
        <AdminTd className="text-xs tabular-nums text-muted-foreground">
          {formatAdminDate(row.userLastActiveAt)}
        </AdminTd>
        <AdminTd className="text-sm tabular-nums text-foreground">
          {row.submissions.length}
        </AdminTd>
        <AdminTd className="text-sm tabular-nums">
          {paymentAmount ? (
            <span className="text-foreground">
              {formatAmount(paymentAmount)}
            </span>
          ) : (
            <span className="text-subtle-foreground">—</span>
          )}
        </AdminTd>
      </tr>

      {isExpanded && (
        <tr id={detailsId} className="border-b border-border bg-surface">
          <td colSpan={SUBMISSIONS_TABLE_COLUMN_COUNT} className="p-0">
            <div className="flex flex-col divide-y divide-border px-3 py-1 md:pr-4 md:pl-12">
              {row.submissions.map(submission => (
                <SubmissionDetailRow
                  key={submission.id}
                  submission={submission}
                  onOpenImage={onOpenImage}
                />
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
