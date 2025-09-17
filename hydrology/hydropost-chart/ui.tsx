import { InputNumber } from 'antd';

import { calcStepSize } from 'app/entities/chart-utils/utils';
import { visibleGraphStore } from 'app/entities/meteorology/visible-graph-store/model';
import { NoDataGraph } from 'app/entities/no-data-graph/ui';
import { CloseBlackButton } from 'app/features/close-black-button/ui';
import 'app/shared/utils/chartjs-setup';
import 'chartjs-adapter-date-fns';
import { useEffect, useRef, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { useChartData } from './hooks/use-chart-data';
import { useChartOptions } from './hooks/use-chart-options';
import { useDownloadCsv } from './hooks/use-download-csv';
import { useHydropostLabels } from './hooks/use-hydropost-labels';
import { useSelectedPoint } from './hooks/use-selected-point';
import { hydropostChartStore } from './model';
import styles from './styles.module.scss';

const { setYAxisScaleMin, setYAxisScaleMax } = hydropostChartStore.getState();
const resetGraph = visibleGraphStore.getState().resetGraph;

export const HydropostChart = () => {
  const selectedPoint = useSelectedPoint();
  const isLoading = hydropostChartStore((state) => state.isLoading);

  const yAxisScaleMin = hydropostChartStore((state) => state.yAxisScaleMin);
  const yAxisScaleMax = hydropostChartStore((state) => state.yAxisScaleMax);
  const [waterLevelDelta, setWaterLevelDelta] = useState(0);
  useHydropostLabels();
  const [step, setStep] = useState(0.1);

  const chartData = useChartData({ waterLevelDelta });
  const chartOptions = useChartOptions();
  const downloadCsv = useDownloadCsv();

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // пропускаем первый вызов
    }
    console.log('Точка поменялась');
    resetGraph();
  }, [selectedPoint]);

  const hasData = selectedPoint && chartData.datasets.length > 0;

  return (
    <div className={styles.hydroInfoCharts}>
      <div className={styles.chartWrapper}>
        <div className={styles.csvDownloadBtn} onClick={downloadCsv}>
          Скачать csv
        </div>

        <CloseBlackButton onClick={resetGraph} />

        {hasData ? (
          <>
            <div className={styles.scaleOptions} style={{ position: 'absolute', left: 30 }}>
              <div className={styles.scaleOptionsTitle}>Уровень воды:</div>
              <div className={styles.scaleOptionsElement}>
                мин.{' '}
                <InputNumber
                  value={yAxisScaleMin}
                  size='small'
                  style={{ fontSize: 12, width: 60 }}
                  step={step}
                  onChange={(e) => {
                    if (typeof e === 'number' && e < yAxisScaleMax) {
                      setYAxisScaleMin(e);
                      setStep(calcStepSize(yAxisScaleMax - e));
                    }
                  }}
                />
              </div>
              <div className={styles.scaleOptionsElement}>
                макс.{' '}
                <InputNumber
                  value={yAxisScaleMax}
                  size='small'
                  style={{ fontSize: 12, width: 60 }}
                  step={step}
                  onChange={(e) => {
                    if (typeof e === 'number' && e > yAxisScaleMin) {
                      setYAxisScaleMax(e);
                      setStep(calcStepSize(e - yAxisScaleMin));
                    }
                  }}
                />
              </div>
              <div className={styles.scaleOptionsElement}>
                поправка{' '}
                <InputNumber
                  value={waterLevelDelta}
                  size='small'
                  style={{ fontSize: 12, width: 60 }}
                  step={step}
                  onChange={(e) => {
                    if (typeof e === 'number') {
                      setWaterLevelDelta(e);
                    }
                  }}
                />
              </div>
            </div>

            <Chart type='line' data={chartData} options={chartOptions} />
          </>
        ) : (
          <NoDataGraph isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};
