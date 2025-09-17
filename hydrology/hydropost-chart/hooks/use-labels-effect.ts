import { createLabelsEffectHook } from '@app/shared/charts/create-labels-effect-hook';
import { hydropostArchiveChartStore } from '../model';

export const useHydropostArchiveLabels = createLabelsEffectHook(() =>
  hydropostArchiveChartStore.getState(),
);
