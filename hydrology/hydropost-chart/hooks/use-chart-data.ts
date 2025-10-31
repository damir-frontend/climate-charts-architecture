import { createChartDataHook } from '@app/shared/charts/create-chart-data-hook';
import { ChartData } from 'chart.js/auto';
import { COLORS, LABELS, METRICS } from '../metrics';
import { hydropostArchiveChartStore } from '../model';
import { metricKeys } from '../types.metrics';

const useChartDataBase = createChartDataHook({
  METRICS,
  LABELS,
  COLORS,
  metricKeys,
});

export const useChartData = (): ChartData<'line'> =>
  useChartDataBase(() =>
    hydropostArchiveChartStore((state) => ({
      data: state.data,
      labels: state.labels,
    })),
  );
