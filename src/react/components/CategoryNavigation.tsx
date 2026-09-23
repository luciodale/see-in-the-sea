import {
  MEDITERRANEAN_CATEGORY_ID,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../../constants';
import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import type { UICategory } from '../../types/ui';
import { useScrollActiveTabIntoView } from '../hooks/useScrollActiveTabIntoView';
import { countCompletePortfolios } from '../utils/portfolio';
import { cn } from './ui/cn';

type CategoryNavigationProps = {
  categories: UICategory[];
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
};

// Mediterranean counts complete portfolios, every other category counts photos
function getCategoryProgress(category: UICategory) {
  if (category.id === MEDITERRANEAN_CATEGORY_ID) {
    const completePortfolios = countCompletePortfolios(category.submissions);
    return {
      label: `${completePortfolios}/${PORTFOLIOS_PER_MEDITERRANEAN}`,
      isComplete: completePortfolios >= PORTFOLIOS_PER_MEDITERRANEAN,
    };
  }

  const photoCount = category.submissions.length;
  return {
    label: `${photoCount}/${category.maxSubmissions}`,
    isComplete: photoCount >= category.maxSubmissions,
  };
}

export function CategoryNavigation({
  categories,
  activeCategoryId,
  onCategorySelect,
}: CategoryNavigationProps) {
  const { t } = useI18n();
  const activeTabRef = useScrollActiveTabIntoView(activeCategoryId);

  return (
    <nav
      aria-label={t('submissions.tabs.label')}
      className="-mx-4 overflow-x-auto sm:-mx-6"
    >
      {/* w-max keeps the next tab peeking past the edge as the scroll hint */}
      <div className="flex w-max items-center gap-2 px-4 pb-1 sm:px-6 lg:w-full lg:flex-wrap lg:justify-center">
        {categories.map(category => {
          const isActive = activeCategoryId === category.id;
          const { label, isComplete } = getCategoryProgress(category);

          return (
            <button
              type="button"
              ref={isActive ? activeTabRef : undefined}
              aria-current={isActive ? 'true' : undefined}
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 min-h-11 px-4 text-editorial uppercase tracking-editorial rounded-full transition-colors duration-200 cursor-pointer',
                isActive
                  ? 'bg-foreground/15 font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
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
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
