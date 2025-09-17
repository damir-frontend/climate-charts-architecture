import { workPointStore } from 'app/entities/work-point/model';
import { checkMeteopostArchive } from 'app/entities/work-point/operating-point/utils';
import { layerStore } from 'app/features/LayerSelector';
import 'chartjs-adapter-date-fns';
import { Chart } from 'react-chartjs-2';
import { visibleGraphStore } from '../visible-graph-store/model';
import styles from './styles.module.scss';

import { NoDataGraph } from 'app/entities/no-data-graph/ui';
import { CloseBlackButton } from 'app/features/close-black-button/ui';
import 'app/shared/utils/chartjs-setup';
import { useChartData } from './hooks/use-chart-data';
import { useChartOptions } from './hooks/use-chart-options';
import { useDownloadCsv } from './hooks/use-download-csv';
import { useDrawEffect } from './hooks/use-draw-effect';
import { useLabelsEffect } from './hooks/use-labels-effect';

const resetGraph = visibleGraphStore.getState().resetGraph;

export const MeteopostArchiveChart = () => {
  // const data = meteopostChartStore((state) => state.data);
  const selectedPointId = workPointStore((state) => state.selectedId);
  const mapPoints = workPointStore((state) => state.mapPoints);
  // ? разобраться с типами. всё равно в checkMeteopostArchive передавать null нельзя
  const selectedPoint = selectedPointId ? mapPoints.get(selectedPointId) : null;

  const isLoading = layerStore((state) => state.isLoading());

  useLabelsEffect();
  const chartData = useChartData();
  const chartOptions = useChartOptions();
  const downloadCsv = useDownloadCsv();
  useDrawEffect();

  const hasData = selectedPoint && chartData.datasets.length > 0;

  return (
    <div className={styles.meteoinfoCharts}>
      <div className={styles.chartWrapper}>
        {chartData.datasets.length > 0 ? (
          <div className={styles.csvDownloadBtn} onClick={downloadCsv}>
            Скачать csv
          </div>
        ) : null}

        <CloseBlackButton onClick={resetGraph} />

        {selectedPoint && checkMeteopostArchive(selectedPoint) ? (
          hasData ? (
            <Chart type='line' data={chartData} options={chartOptions} />
          ) : (
            <NoDataGraph isLoading={isLoading} />
          )
        ) : (
          <div className={styles.nodataContainer}>
            <div className={styles.nodataMessage}>
              График архивного метеопоста для данного вида объекта не предусмотрен
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
