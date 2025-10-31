import { createLabelsEffectHook } from '@app/shared/charts/create-labels-effect-hook';
import { meteopostArchiveChartStore } from '../model';

export const useMeteopostArchiveLabels = createLabelsEffectHook(() =>
  meteopostArchiveChartStore.getState(),
);
