import {
  PHOTOS_PER_PORTFOLIO,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../../constants';
import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import type { UICategory } from '../../types/ui';
import { cn } from './ui/cn';

type CategoryNavigationProps = {
  categories: UICategory[];
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
};

export function CategoryNavigation({
  categories,
  activeCategoryId,
  onCategorySelect,
}: CategoryNavigationProps) {
  const { t } = useI18n();

  return (
    <nav className="flex items-center justify-start sm:justify-center gap-6 overflow-x-auto -mx-4 px-4 py-1">
      {categories.map(category => {
        const submissionCount = category.submissions.length;
        const isActive = activeCategoryId === category.id;

        let isComplete = false;
        let displayCount = `${submissionCount}/${category.maxSubmissions}`;

        if (category.id === 'mediterranean') {
          const portfolio1 = category.submissions.filter(
            s => s.portfolio === '1'
          );
          const portfolio2 = category.submissions.filter(
            s => s.portfolio === '2'
          );

          const portfolio1Complete =
            portfolio1.length === PHOTOS_PER_PORTFOLIO &&
            portfolio1.some(s => s.portfolioPhotoType === 'macro') &&
            portfolio1.some(s => s.portfolioPhotoType === 'wide-angle') &&
            portfolio1.some(s => s.portfolioPhotoType === 'free');

          const portfolio2Complete =
            portfolio2.length === PHOTOS_PER_PORTFOLIO &&
            portfolio2.some(s => s.portfolioPhotoType === 'macro') &&
            portfolio2.some(s => s.portfolioPhotoType === 'wide-angle') &&
            portfolio2.some(s => s.portfolioPhotoType === 'free');

          const completePortfolios =
            (portfolio1Complete ? 1 : 0) + (portfolio2Complete ? 1 : 0);
          displayCount = `${completePortfolios}/${PORTFOLIOS_PER_MEDITERRANEAN}`;
          isComplete = completePortfolios >= PORTFOLIOS_PER_MEDITERRANEAN;
        } else {
          isComplete = submissionCount >= category.maxSubmissions;
        }

        return (
          <button
            type="button"
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              'text-editorial uppercase tracking-editorial transition-colors duration-200 cursor-pointer flex-shrink-0 flex items-center gap-2',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>
              {t(`category.${category.id}` as unknown as TranslationKey)}
            </span>
            <span
              className={cn(
                'tabular-nums tracking-normal text-tiny',
                isComplete ? 'text-success' : 'text-subtle-foreground'
              )}
            >
              {displayCount}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
