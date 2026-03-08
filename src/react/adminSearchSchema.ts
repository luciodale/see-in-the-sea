export type AdminSearchParams = {
  contestId?: string;
};

export function validateAdminSearch(
  search: Record<string, unknown>
): AdminSearchParams {
  return {
    contestId:
      typeof search.contestId === 'string' ? search.contestId : undefined,
  };
}
