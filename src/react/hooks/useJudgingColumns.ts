import { MEDITERRANEAN_CATEGORY_ID } from '../../constants';
import type { FilterStatus } from '../types/judging';
import { useImageResize } from './useImageResize';

// Mediterranean views use fixed grids except the shortlist (drag to reorder):
// summary cards (no photo preview) four per row, wide enough for the hover
// voting toolbar; winners one full width portfolio per row.
const MEDITERRANEAN_SUMMARY_COLUMNS = 4;
const MEDITERRANEAN_WINNERS_COLUMNS = 1;

function defaultColumnsFor(
  isMediterranean: boolean,
  filterStatus: FilterStatus
) {
  if (!isMediterranean) return 4;
  return filterStatus === 'shortlisted' ? 1 : 3;
}

export function useJudgingColumns(
  activeCategory: string,
  filterStatus: FilterStatus
) {
  const isMediterranean = activeCategory === MEDITERRANEAN_CATEGORY_ID;
  const isResizable = !isMediterranean || filterStatus === 'shortlisted';
  const fixedColumns =
    filterStatus === 'winners'
      ? MEDITERRANEAN_WINNERS_COLUMNS
      : MEDITERRANEAN_SUMMARY_COLUMNS;
  const { columns, setColumns } = useImageResize(
    activeCategory,
    filterStatus,
    defaultColumnsFor(isMediterranean, filterStatus)
  );

  return {
    columns: isResizable ? columns : fixedColumns,
    setColumns,
    isResizable,
  };
}
