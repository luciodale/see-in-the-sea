import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

type FlexibilityInfoPanelProps = {
  contestId: string;
};

function getStorageKey(contestId: string) {
  return `flexibility-info-dismissed-${contestId}`;
}

export function FlexibilityInfoPanel({ contestId }: FlexibilityInfoPanelProps) {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(getStorageKey(contestId)) === 'true';
    } catch {
      return false;
    }
  });
  const [visible, setVisible] = useState(!dismissed);

  useEffect(() => {
    setDismissed(() => {
      try {
        return localStorage.getItem(getStorageKey(contestId)) === 'true';
      } catch {
        return false;
      }
    });
  }, [contestId]);

  useEffect(() => {
    setVisible(!dismissed);
  }, [dismissed]);

  function handleDismiss() {
    setVisible(false);
    // Wait for fade-out before writing storage
    setTimeout(() => {
      try {
        localStorage.setItem(getStorageKey(contestId), 'true');
      } catch {
        // Ignore storage errors
      }
      setDismissed(true);
    }, 300);
  }

  if (dismissed) return null;

  return (
    <div
      className={`transition-all duration-300 ${visible ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}
    >
      <Card variant="info">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-sky-400/80 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-sky-200/90 mb-0.5">
              {t('info.flexibility.title')}
            </h3>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              {t('info.flexibility.message')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 flex-shrink-0"
          >
            {t('info.flexibility.dismiss')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
