import { createChartScalesHook } from '@app/shared/charts/create-chart-scales-hook';
import { createMonthTickCallbackX } from '@app/shared/charts/ticks/create-tick-callback';
import {
  COLORS_AXIS,
  LABELS_AXIS,
  METRIC_AXES_KEYS,
  METRICS_BY_AXIS,
  UNITS_AXIS,
} from '../metrics';
import { meteopostArchiveChartStore } from '../model';
import { ScalesType } from '../types';
import { MetricAxis, MetricKey } from '../types.metrics';

const tickCallbackX = createMonthTickCallbackX(6);

const useChartScales = createChartScalesHook<MetricKey, MetricAxis, ScalesType>({
  METRICS_BY_AXIS,
  METRIC_AXES_KEYS,
  LABELS_AXIS,
  UNITS_AXIS,
  COLORS_AXIS,
  unitX: 'month',
  unitX1: 'year',
  tickCallbackX,
});

export function useChartScalesWrapper() {
  return useChartScales(() => meteopostArchiveChartStore.getState());
}
