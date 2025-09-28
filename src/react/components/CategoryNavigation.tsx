import {
  PHOTOS_PER_PORTFOLIO,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../../constants';
import type { TranslationKey } from '../../i18n';
import { useI18n } from '../../i18n/react';
import type { UICategory } from '../../types/ui';
import { PayNowButton } from './PayNowButton';

type CategoryNavigationProps = {
  categories: UICategory[];
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  hasSubmissions?: boolean;
  hasPaid?: boolean;
};

export function CategoryNavigation({
  categories,
  activeCategoryId,
  onCategorySelect,
  hasSubmissions = false,
  hasPaid = false,
}: CategoryNavigationProps) {
  const { t } = useI18n();

  return (
    <nav className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
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
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                  ${isComplete ? 'ring-2 ring-emerald-500' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span>
                    {t(`category.${category.id}` as unknown as TranslationKey)}
                  </span>
                  <span
                    className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${
                      isComplete
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-600 text-slate-300'
                    }
                  `}
                  >
                    {displayText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pay Now Button - show if user has submissions and hasn't paid */}
        {hasSubmissions && !hasPaid && (
          <div className="flex-shrink-0">
            <PayNowButton />
          </div>
        )}
      </div>
    </nav>
  );
}
