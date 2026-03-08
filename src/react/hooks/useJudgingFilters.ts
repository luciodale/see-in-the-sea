import { useCallback, useMemo } from 'react';
import type {
  FilterStatus,
  JudgingSubmission,
  PortfolioGroup,
} from '../types/judging';

type UseJudgingFiltersParams = {
  submissions: JudgingSubmission[];
  activeCategory: string;
  filterStatus: FilterStatus;
  isMediterranean: boolean;
};

type UseJudgingFiltersResult = {
  categorySubmissions: JudgingSubmission[];
  sortedSubmissions: JudgingSubmission[];
  portfoliosList: PortfolioGroup[];
  groupedByUser: Record<string, Record<string, JudgingSubmission[]>> | null;
  counts: {
    total: number;
    shortlisted: number;
    rejected: number;
    pending: number;
    winners: number;
  };
  placementCounts: Record<string, number>;
  shortlistedSubmissions: JudgingSubmission[];
  shortlistedPortfolios: (PortfolioGroup & { id: string })[];
};

export function useJudgingFilters({
  submissions,
  activeCategory,
  filterStatus,
  isMediterranean,
}: UseJudgingFiltersParams): UseJudgingFiltersResult {
  const categorySubmissions = useMemo(
    () => submissions.filter(s => s.categoryId === activeCategory),
    [submissions, activeCategory]
  );

  const sortedSubmissions = useMemo(() => {
    const filtered =
      filterStatus === 'all'
        ? categorySubmissions
        : filterStatus === 'winners'
          ? categorySubmissions.filter(s => s.placement !== null)
          : categorySubmissions.filter(s => s.flagStatus === filterStatus);

    if (filterStatus === 'winners') {
      return [...filtered].sort((a, b) => {
        const order = { first: 1, second: 2, third: 3, 'runner-up': 4 };
        const aOrder = a.placement ? order[a.placement] || 99 : 99;
        const bOrder = b.placement ? order[b.placement] || 99 : 99;
        return aOrder - bOrder;
      });
    }
    return filtered;
  }, [categorySubmissions, filterStatus]);

  const getUniquePortfolioKeys = useCallback((subs: JudgingSubmission[]) => {
    return [
      ...new Set(
        subs
          .filter(s => s.portfolio && s.portfolio !== 'ungrouped')
          .map(s => `${s.anonymousUserId || 'unknown'}-${s.portfolio}`)
      ),
    ];
  }, []);

  const portfoliosList = useMemo(() => {
    if (!isMediterranean) return [];

    const result: PortfolioGroup[] = [];
    const portfolioMap = new Map<string, JudgingSubmission[]>();

    sortedSubmissions.forEach(s => {
      const userKey = s.anonymousUserId || 'unknown';
      const portfolioNum = s.portfolio || 'ungrouped';
      const compositeKey = `${userKey}-${portfolioNum}`;

      if (!portfolioMap.has(compositeKey)) {
        portfolioMap.set(compositeKey, []);
      }
      const existing = portfolioMap.get(compositeKey);
      if (!existing) return;
      const hasPhotoType = existing.some(
        e => e.portfolioPhotoType === s.portfolioPhotoType
      );
      if (!hasPhotoType) {
        existing.push(s);
      }
    });

    portfolioMap.forEach((subs, compositeKey) => {
      if (!compositeKey.endsWith('-ungrouped') && subs.length > 0) {
        result.push({ portfolioId: compositeKey, submissions: subs });
      }
    });

    return result;
  }, [isMediterranean, sortedSubmissions]);

  const groupedByUser = useMemo(() => {
    if (!isMediterranean) return null;
    return portfoliosList.reduce(
      (acc, p) => {
        const userKey = p.submissions[0]?.anonymousUserId || 'unknown';
        if (!acc[userKey]) acc[userKey] = {};
        acc[userKey][p.portfolioId] = p.submissions;
        return acc;
      },
      {} as Record<string, Record<string, JudgingSubmission[]>>
    );
  }, [isMediterranean, portfoliosList]);

  const counts = useMemo(() => {
    if (isMediterranean) {
      const allPortfolioKeys = getUniquePortfolioKeys(categorySubmissions);
      const shortlistedKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.flagStatus === 'shortlisted')
      );
      const rejectedKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.flagStatus === 'rejected')
      );
      const pendingKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.flagStatus === 'pending')
      );
      const winnersKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.placement !== null)
      );

      return {
        total: allPortfolioKeys.length,
        shortlisted: shortlistedKeys.length,
        rejected: rejectedKeys.length,
        pending: pendingKeys.length,
        winners: winnersKeys.length,
      };
    }
    const shortlisted = categorySubmissions.filter(
      s => s.flagStatus === 'shortlisted'
    ).length;
    const rejected = categorySubmissions.filter(
      s => s.flagStatus === 'rejected'
    ).length;
    const pending = categorySubmissions.filter(
      s => s.flagStatus === 'pending'
    ).length;
    const winners = categorySubmissions.filter(
      s => s.placement !== null
    ).length;
    return {
      total: categorySubmissions.length,
      shortlisted,
      rejected,
      pending,
      winners,
    };
  }, [isMediterranean, categorySubmissions, getUniquePortfolioKeys]);

  const placementCounts = useMemo(() => {
    if (isMediterranean) {
      return (['first', 'second', 'third', 'runner-up'] as const).reduce(
        (acc, placement) => {
          const uniquePortfolioKeys = getUniquePortfolioKeys(
            categorySubmissions.filter(s => s.placement === placement)
          );
          acc[placement] = uniquePortfolioKeys.length;
          return acc;
        },
        {} as Record<string, number>
      );
    }
    return categorySubmissions.reduce(
      (acc, s) => {
        if (s.placement) acc[s.placement] = (acc[s.placement] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [isMediterranean, categorySubmissions, getUniquePortfolioKeys]);

  const shortlistedSubmissions = useMemo(
    () => categorySubmissions.filter(s => s.flagStatus === 'shortlisted'),
    [categorySubmissions]
  );

  const shortlistedPortfolios = useMemo(
    () =>
      portfoliosList
        .filter(p => p.submissions[0]?.flagStatus === 'shortlisted')
        .map(p => ({ id: p.portfolioId, ...p })),
    [portfoliosList]
  );

  return {
    categorySubmissions,
    sortedSubmissions,
    portfoliosList,
    groupedByUser,
    counts,
    placementCounts,
    shortlistedSubmissions,
    shortlistedPortfolios,
  };
}
