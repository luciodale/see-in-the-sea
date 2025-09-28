import { memo, useMemo } from 'react';
import {
  MEDITERRANEAN_MAX_SUBMISSIONS,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../../constants';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { PortfolioGrid } from './PortfolioGrid';

type MediterraneanPortfolioManagerProps = {
  submissions: UISubmission[];
  hasPaid?: boolean;
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onManageSubmission: (submission: UISubmission) => void;
};

export const MediterraneanPortfolioManager = memo(
  function MediterraneanPortfolioManager({
    submissions,
    hasPaid = false,
    onUploadClick,
    onManageSubmission,
  }: MediterraneanPortfolioManagerProps) {
    const { t } = useI18n();
    const portfolioGrids = useMemo(() => {
      return [{ portfolioNumber: 1 as const }, { portfolioNumber: 2 as const }];
    }, []);

    return (
      <div className="space-y-6">
        {/* Portfolio Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioGrids.map(({ portfolioNumber }) => (
            <PortfolioGrid
              key={portfolioNumber}
              portfolioNumber={portfolioNumber}
              submissions={submissions}
              hasPaid={hasPaid}
              onUploadClick={onUploadClick}
              onManageSubmission={onManageSubmission}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-300">
            <strong>{t('mediterranean.instructions.title')}</strong>{' '}
            {t('mediterranean.instructions.content')}{' '}
            {PORTFOLIOS_PER_MEDITERRANEAN}{' '}
            {t('mediterranean.instructions.portfolios')} (
            {MEDITERRANEAN_MAX_SUBMISSIONS}{' '}
            {t('mediterranean.instructions.photos-total')}).
          </p>
        </div>
      </div>
    );
  }
);
