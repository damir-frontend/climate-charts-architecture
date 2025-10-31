import { getBaseChartOptions } from '@app/shared/charts/get-base-chart-options';
import { createLegendClickHandler } from '@app/shared/charts/handlers/handle-legend-click';
import { DatasetType } from '@app/shared/charts/types';
import { ChartOptions } from 'chart.js/auto';
import { useMemo } from 'react';
import { LABELS, METRICS_AXIS_MAP, METRICS_BY_AXIS } from '../metrics';
import { useChartScalesWrapper } from './use-chart-scales';

export const useChartOptions = (): ChartOptions<DatasetType> => {
  const chartScales = useChartScalesWrapper();

  return useMemo(() => {
    const base = getBaseChartOptions(chartScales, METRICS_AXIS_MAP);
    return {
      ...base,
      plugins: {
        ...base.plugins,
        legend: {
          onClick: createLegendClickHandler(LABELS, METRICS_BY_AXIS),
        },
      },
    };
  }, [chartScales]);
};
