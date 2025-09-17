import { NoDataGraph } from '@app/entities/no-data-graph/ui';
import { UnsupportedGraph } from '@app/entities/unsupported-graph/ui';
import { checkMeteopostArchive } from '@app/entities/work-point/operating-point/utils/check';
import { CloseBlackButton } from '@app/features/close-black-button/ui';
import { CsvDownloadButton } from '@app/features/csv-download-button/ui';
import { useDownloadCsv } from '@app/shared/charts/hooks/use-download-csv';
import { useSelectedPointFirstRenderSkipEffect } from '@app/shared/charts/hooks/use-selected-point-first-render-skip-effect';
import styles from '@app/shared/charts/styles.module.scss';
import { isWorkPoint } from '@app/shared/utils/is-work-point';
import { useCallback } from 'react';
import { Chart } from 'react-chartjs-2';
import { useDrawEffect } from '../../../shared/charts/hooks/use-draw-effect';
import { GraphKey, visibleGraphStore } from '../visible-graph-store/model';
import { useChartData } from './hooks/use-chart-data';
import { useChartOptions } from './hooks/use-chart-options';
import { useMeteopostArchiveLabels } from './hooks/use-labels-effect';
import { LABELS, UNITS } from './metrics';
import { meteopostArchiveChartStore } from './model';

const resetGraph = visibleGraphStore.getState().resetGraph;

export const MeteopostArchiveChart = () => {
  const isLoading = meteopostArchiveChartStore((state) => state.isLoadingMeteopostArchive);

  useMeteopostArchiveLabels();
  const chartData = useChartData();
  const chartOptions = useChartOptions();
  const downloadCsv = useDownloadCsv(
    () => meteopostArchiveChartStore.getState().data,
    'meteopost-archive',
    LABELS,
    UNITS,
  );

  const getArgsFn = useCallback((point) => ({ sid_id: point.mp_id_arc }), []);
  useDrawEffect({
    graphKey: GraphKey.MeteopostArchive,
    fetchData: meteopostArchiveChartStore.getState().loadMeteopostArchiveData,
    checkSelectedWorkPoint: checkMeteopostArchive,
    getFetchArgs: getArgsFn,
  });

  const { selectedPoint } = useSelectedPointFirstRenderSkipEffect();
  const isSupportedPoint = isWorkPoint(selectedPoint) && checkMeteopostArchive(selectedPoint);
  const hasData = isWorkPoint(selectedPoint) && chartData.datasets.length > 0;

  const renderContent = () => {
    if (!isSupportedPoint) return <UnsupportedGraph />;
    if (hasData) return <Chart type='line' data={chartData} options={chartOptions} />;
    return <NoDataGraph isLoading={isLoading} />;
  };

  return (
    <div className={styles.infoCharts}>
      <div className={styles.chartWrapper}>
        <CsvDownloadButton onClick={downloadCsv} />
        <CloseBlackButton onClick={resetGraph} />
        {renderContent()}
      </div>
    </div>
  );
};
