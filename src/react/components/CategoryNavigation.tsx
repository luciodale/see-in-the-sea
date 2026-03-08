import {
  PHOTOS_PER_PORTFOLIO,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../../constants';
import type { TranslationKey } from '../../i18n';
import { useI18n } from '../../i18n/react';
import type { UICategory } from '../../types/ui';
import { Badge } from './ui/Badge';
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
    <nav className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div className="flex overflow-x-auto gap-2 -mx-1 px-1 pb-1">
        {categories.map(category => {
          const submissionCount = category.submissions.length;
          const isActive = activeCategoryId === category.id;

          // Special handling for Mediterranean category
          let isComplete = false;
          let displayText = `${submissionCount}/${category.maxSubmissions}`;

          if (category.id === 'mediterranean') {
            // Count complete portfolios (3 photos each)
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
            displayText = `${completePortfolios}/${PORTFOLIOS_PER_MEDITERRANEAN} portfolios`;
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
                'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex-shrink-0',
                isActive
                  ? 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
                isComplete && 'ring-1 ring-emerald-500/60'
              )}
            >
              <div className="flex items-center gap-2">
                <span>
                  {t(`category.${category.id}` as unknown as TranslationKey)}
                </span>
                <Badge variant={isComplete ? 'success' : 'default'}>
                  {displayText}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
