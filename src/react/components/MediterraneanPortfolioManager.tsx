import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { memo, useMemo, useState } from 'react';
import { useI18n } from '../../i18n/react';
import type { UISubmission } from '../../types/ui';
import { PORTFOLIO_NUMBERS } from '../utils/portfolio';
import { PortfolioGrid } from './PortfolioGrid';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from './ui/cn';

type MediterraneanPortfolioManagerProps = {
  submissions: UISubmission[];
  canUpload: boolean;
  isLocked: boolean;
  justUploadedId: string | null;
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onManageSubmission: (submission: UISubmission) => void;
};

export const MediterraneanPortfolioManager = memo(
  function MediterraneanPortfolioManager({
    submissions,
    canUpload,
    isLocked,
    justUploadedId,
    onUploadClick,
    onManageSubmission,
  }: MediterraneanPortfolioManagerProps) {
    const { t } = useI18n();

    const steps = useMemo(
      () => [
        t('mediterranean.how.step-1'),
        t('mediterranean.how.step-2'),
        t('mediterranean.how.step-3'),
      ],
      [t]
    );

    // Collapsible only once there is something to look at; until then it stays open
    const hasPhotos = submissions.length > 0;
    const [isOpenOverride, setIsOpenOverride] = useState<boolean | null>(null);
    const isOpen = !hasPhotos || (isOpenOverride ?? false);

    function handleToggle() {
      setIsOpenOverride(!isOpen);
    }

    return (
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-3 p-4 sm:p-5">
          {hasPhotos ? (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleToggle}
              aria-expanded={isOpen}
              className="min-h-11 justify-between px-0"
            >
              {t('mediterranean.how.title')}
              <ChevronDownIcon
                aria-hidden="true"
                className={cn(
                  'size-4 shrink-0 transition-transform duration-300',
                  isOpen && 'rotate-180'
                )}
              />
            </Button>
          ) : (
            <h3 className="font-serif text-lg text-foreground leading-heading">
              {t('mediterranean.how.title')}
            </h3>
          )}

          {isOpen && (
            <ul className="flex flex-col gap-2">
              {steps.map(step => (
                <li
                  key={step}
                  className="flex items-start gap-3 font-light text-sm text-muted-foreground leading-paragraph"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-border-strong"
                  />
                  {step}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PORTFOLIO_NUMBERS.map(portfolioNumber => (
            <PortfolioGrid
              key={portfolioNumber}
              portfolioNumber={portfolioNumber}
              submissions={submissions}
              canUpload={canUpload}
              isLocked={isLocked}
              justUploadedId={justUploadedId}
              onUploadClick={onUploadClick}
              onManageSubmission={onManageSubmission}
            />
          ))}
        </div>
      </div>
    );
  }
);
