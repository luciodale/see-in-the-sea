import type { TranslationKey } from '../../i18n';
import { useI18n } from '../../i18n/react';

type Category = {
  id: string;
  name: string;
  submissions: Array<{
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  }>;
};

type CategoryNavigationProps = {
  categories: Category[];
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  maxSubmissionsPerCategory: number;
};

export function CategoryNavigation({
  categories,
  activeCategoryId,
  onCategorySelect,
  maxSubmissionsPerCategory,
}: CategoryNavigationProps) {
  const { t } = useI18n();

  return (
    <nav className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const submissionCount = category.submissions.length;
          const isActive = activeCategoryId === category.id;
          const isComplete = submissionCount >= maxSubmissionsPerCategory;

          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
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
                  {submissionCount}/{maxSubmissionsPerCategory}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
