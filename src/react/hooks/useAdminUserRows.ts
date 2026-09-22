import { useMemo } from 'react';
import type { AdminSubmission } from '../../types/api';
import { formatFullName } from '../utils/adminFormat';

export type AdminUserRow = Pick<
  AdminSubmission,
  | 'userEmail'
  | 'firstName'
  | 'lastName'
  | 'userCreatedAt'
  | 'userLastActiveAt'
  | 'hasPaid'
> & {
  submissions: AdminSubmission[];
};

function groupByUser(submissions: AdminSubmission[]) {
  const groups = new Map<string, AdminSubmission[]>();
  for (const submission of submissions) {
    const group = groups.get(submission.userEmail);
    if (group) {
      group.push(submission);
    } else {
      groups.set(submission.userEmail, [submission]);
    }
  }
  return groups;
}

function toUserRow(userEmail: string, submissions: AdminSubmission[]) {
  const [first] = submissions;
  return {
    userEmail,
    firstName: first.firstName,
    lastName: first.lastName,
    userCreatedAt: first.userCreatedAt,
    userLastActiveAt: first.userLastActiveAt,
    hasPaid: first.hasPaid,
    submissions,
  } satisfies AdminUserRow;
}

function matchesSearch(row: AdminUserRow, searchLower: string) {
  const fullName = formatFullName(row.firstName, row.lastName).toLowerCase();
  return (
    fullName.includes(searchLower) ||
    row.userEmail.toLowerCase().includes(searchLower)
  );
}

export function useAdminUserRows(
  submissions: AdminSubmission[],
  search: string
) {
  const allRows = useMemo(
    () =>
      Array.from(groupByUser(submissions), ([email, userSubmissions]) =>
        toUserRow(email, userSubmissions)
      ),
    [submissions]
  );

  const userRows = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return allRows;
    return allRows.filter(row => matchesSearch(row, searchLower));
  }, [allRows, search]);

  const visiblePhotoCount = useMemo(
    () => userRows.reduce((sum, row) => sum + row.submissions.length, 0),
    [userRows]
  );

  // Aggregate stats ignore the search filter
  const usersWhoSubmitted = allRows.length;
  const usersWhoPaid = allRows.filter(row => row.hasPaid).length;

  return {
    userRows,
    visiblePhotoCount,
    totalPhotoCount: submissions.length,
    usersWhoSubmitted,
    usersWhoPaid,
  };
}
