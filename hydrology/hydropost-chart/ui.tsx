import {
  GraphKey,
  visibleGraphStore,
} from '@app/entities/meteorology/visible-graph-store/model';
import { NoDataGraph } from '@app/entities/no-data-graph/ui';
import { UnsupportedGraph } from '@app/entities/unsupported-graph/ui';
import { checkHydropostArchive } from '@app/entities/work-point/operating-point/utils/check';
import { CloseBlackButton } from '@app/features/close-black-button/ui';
import { CsvDownloadButton } from '@app/features/csv-download-button/ui';
import { useDownloadCsv } from '@app/shared/charts/hooks/use-download-csv';
import { useDrawEffect } from '@app/shared/charts/hooks/use-draw-effect';
import { useSelectedPointFirstRenderSkipEffect } from '@app/shared/charts/hooks/use-selected-point-first-render-skip-effect';
import styles from '@app/shared/charts/styles.module.scss';
import { isWorkPoint } from '@app/shared/utils/is-work-point';
import { useCallback } from 'react';
import { Chart } from 'react-chartjs-2';
import { useChartData } from './hooks/use-chart-data';
import { useChartOptions } from './hooks/use-chart-options';
import { useHydropostArchiveLabels } from './hooks/use-labels-effect';
import { LABELS, UNITS } from './metrics';
import { hydropostArchiveChartStore } from './model';

const resetGraph = visibleGraphStore.getState().resetGraph;

export const HydropostArchiveChart = () => {
  const isLoading = hydropostArchiveChartStore((state) => state.isLoading);

  useHydropostArchiveLabels();
  const chartData = useChartData();
  const chartOptions = useChartOptions();
  const downloadCsv = useDownloadCsv(
    () => hydropostArchiveChartStore.getState().data,
    'archive-hydropost',
    LABELS,
    UNITS,
  );

  const getArgsFn = useCallback((point) => ({ sid_id: point.hp_id_arc }), []);
  useDrawEffect({
    graphKey: GraphKey.HydropostArchive,
    fetchData: hydropostArchiveChartStore.getState().loadHydropostArchiveData,
    checkSelectedWorkPoint: checkHydropostArchive,
    getFetchArgs: getArgsFn,
  });

  const { selectedPoint } = useSelectedPointFirstRenderSkipEffect();
  const isSupportedPoint = selectedPoint && checkHydropostArchive(selectedPoint);
  const hasData = isWorkPoint(selectedPoint) && chartData.datasets.length > 0;

  return (
    <div className={styles.infoCharts}>
      <div className={styles.chartWrapper}>
        <CsvDownloadButton onClick={downloadCsv} />
        <CloseBlackButton onClick={resetGraph} />

        {isSupportedPoint ? (
          hasData ? (
            <Chart type='line' data={chartData} options={chartOptions} />
          ) : (
            <NoDataGraph isLoading={isLoading} />
          )
        ) : (
          <UnsupportedGraph />
        )}
      </div>
    </div>
  );
};
