import type { AdminUserWithoutUploads } from '../../hooks/useAdminUsersData';
import {
  formatAdminDate,
  formatAmount,
  formatFullName,
} from '../../utils/adminFormat';
import { BaseModal } from '../BaseModal';
import { Badge } from '../ui/Badge';
import { AdminTd, AdminTh } from './AdminTableCells';

const COLUMNS = ['Nome', 'Email', 'Registrato', 'Ultima Attività', 'Pagato'];

type UsersWithoutUploadsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  users: AdminUserWithoutUploads[];
};

export function UsersWithoutUploadsModal({
  isOpen,
  onClose,
  users,
}: UsersWithoutUploadsModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Utenti Senza Foto (${users.length})`}
      maxWidth="4xl"
    >
      <div className="max-h-96 overflow-auto rounded-lg border border-border">
        <table className="min-w-full">
          <thead className="sticky top-0 border-b border-border bg-popover">
            <tr>
              {COLUMNS.map(column => (
                <AdminTh key={column}>{column}</AdminTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const fullName = formatFullName(user.firstName, user.lastName);
              return (
                <tr
                  key={user.email}
                  className="border-b border-border transition-colors last:border-b-0 hover:bg-surface"
                >
                  <AdminTd className="text-sm font-medium text-foreground">
                    {fullName || (
                      <span className="text-subtle-foreground">—</span>
                    )}
                  </AdminTd>
                  <AdminTd className="text-sm text-muted-foreground">
                    {user.email}
                  </AdminTd>
                  <AdminTd className="text-xs tabular-nums text-muted-foreground">
                    {formatAdminDate(user.createdAt)}
                  </AdminTd>
                  <AdminTd className="text-xs tabular-nums text-muted-foreground">
                    {formatAdminDate(user.lastActiveAt)}
                  </AdminTd>
                  <AdminTd>
                    {user.paymentAmount > 0 ? (
                      <span className="text-sm tabular-nums text-foreground">
                        {formatAmount(user.paymentAmount)}
                      </span>
                    ) : (
                      <Badge variant="danger">Non pagato</Badge>
                    )}
                  </AdminTd>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </BaseModal>
  );
}
