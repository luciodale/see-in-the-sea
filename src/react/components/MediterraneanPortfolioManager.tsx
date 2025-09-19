import {
  MEDITERRANEAN_MAX_SUBMISSIONS,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../../constants';
import type { UISubmission } from '../../types/ui';
import { PortfolioGrid } from './PortfolioGrid';

type MediterraneanPortfolioManagerProps = {
  submissions: UISubmission[];
  onUploadClick: (portfolio: string, portfolioPhotoType: string) => void;
  onDeleteClick: (submissionId: string) => void;
};

export function MediterraneanPortfolioManager({
  submissions,
  onUploadClick,
  onDeleteClick,
}: MediterraneanPortfolioManagerProps) {
  return (
    <div className="space-y-6">
      {/* Portfolio Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PortfolioGrid
          portfolioNumber={1}
          submissions={submissions}
          onUploadClick={onUploadClick}
          onDeleteClick={onDeleteClick}
        />
        <PortfolioGrid
          portfolioNumber={2}
          submissions={submissions}
          onUploadClick={onUploadClick}
          onDeleteClick={onDeleteClick}
        />
      </div>

      {/* Instructions */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <p className="text-sm text-slate-300">
          <strong>Instructions:</strong> Click on any empty photo slot to
          upload. To replace a photo, first delete it using the red delete
          button, then upload a new one. Each portfolio must include exactly one
          Macro, one Wide Angle, and one Free Choice photo. You can upload up to
          {PORTFOLIOS_PER_MEDITERRANEAN} complete portfolios (
          {MEDITERRANEAN_MAX_SUBMISSIONS} photos total).
        </p>
      </div>
    </div>
  );
}
