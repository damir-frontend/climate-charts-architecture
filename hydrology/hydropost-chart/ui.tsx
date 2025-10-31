import { CloseCircleOutlined } from '@ant-design/icons';
import { InputNumber } from 'antd';
import {
  chartData,
  COLOR_1,
  COLOR_2,
  COLOR_3,
  COLOR_4,
  COLOR_5,
  TDataCsv,
  TOOLTIP_FORMAT,
} from 'app/entities/chart-utils/const';
import {
  calcStepSize,
  calculateScale,
  createCsv,
  getGraph,
  makeLinkCsv,
} from 'app/entities/chart-utils/utils';
import { workPointStore } from 'app/entities/work-point/model';
import {
  BarController,
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import gradient from 'chartjs-plugin-gradient';
import zoom from 'chartjs-plugin-zoom';
import { ru } from 'date-fns/locale';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { FORMAT_DATE } from 'utils/consts';
import { workPointGraphStore } from '../hydropost-menu/hydropost-draw-chart-menu/model';
import { LABELS, UNITS } from './consts';
import { hydropostChartStore } from './model';
import styles from './styles.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  BarElement,
  zoom,
  // ChartDataLabels,
  gradient,
  // plugin,
  Filler,
);

type ScalesType = {
  x: object;
  x1: object;
  waterLevel?: object | null;
  precipitation?: object | null;
  volume?: object | null;
  waste?: object | null;
};
export const HydropostChart = () => {
  const selectedPointId = workPointStore((state) => state.selectedId);

  const data = hydropostChartStore((state) => state.data);
  const calculatedData = hydropostChartStore((state) => state.calculatedData);
  const dataPrecipitation = hydropostChartStore((state) => state.dataPrecipitation);
  const volumeData = hydropostChartStore((state) => state.volumeData);
  const wasteData = hydropostChartStore((state) => state.wasteData);

  const resetChartHydropost = hydropostChartStore((state) => state.resetChart);

  const labels = hydropostChartStore((state) => state.labels);
  const xAxisMin = hydropostChartStore((state) => state.xAxisMin);
  const xAxisMax = hydropostChartStore((state) => state.xAxisMax);
  const yAxisScaleMin = hydropostChartStore((state) => state.yAxisScaleMin);
  const yAxisScaleMax = hydropostChartStore((state) => state.yAxisScaleMax);
  const yAxisDataMin = hydropostChartStore((state) => state.yAxisDataMin);
  const yAxisDataMax = hydropostChartStore((state) => state.yAxisDataMax);
  const yAxisCalculatedDataMin = hydropostChartStore((state) => state.yAxisCalculatedDataMin);
  const yAxisCalculatedDataMax = hydropostChartStore((state) => state.yAxisCalculatedDataMax);
  const yAxisPrecipitationMin = hydropostChartStore((state) => state.yAxisPrecipitationMin);
  const yAxisPrecipitationMax = hydropostChartStore((state) => state.yAxisPrecipitationMax);
  const yAxisVolumeMin = hydropostChartStore((state) => state.yAxisVolumeMin);
  const yAxisVolumeMax = hydropostChartStore((state) => state.yAxisVolumeMax);
  const yAxisWasteMin = hydropostChartStore((state) => state.yAxisWasteMin);
  const yAxisWasteMax = hydropostChartStore((state) => state.yAxisWasteMax);
  const fromDate = workPointGraphStore((state) => state.fromDate);
  const toDate = workPointGraphStore((state) => state.toDate);

  const setYAxisScaleMin = hydropostChartStore((state) => state.setYAxisScaleMin);
  const setYAxisScaleMax = hydropostChartStore((state) => state.setYAxisScaleMax);
  const offsetCalc = hydropostChartStore((state) => state.offsetCalc);
  const [isShowWaterLevel, setIsShowWaterLevel] = useState(true);
  const [isShowPrecipitation, setIsShowPrecipitation] = useState(true);
  const [isShowVolume, setIsShowVolume] = useState(true);
  const [isShowWaste, setIsShowWaste] = useState(true);

  const chartData = useMemo(() => {
    const cData: ChartData<'line'> = { datasets: [], labels };
    if (data.length > 0) {
      cData.datasets.push(
        getGraph({
          data: data
            .filter((e) => e.y >= yAxisScaleMin && e.y <= yAxisScaleMax)
            .sort((a, b) => a.x - b.x),
          yAxisID: 'waterLevel',
          label: LABELS.DATA,
          color: COLOR_1,
          borderColor: 'rgba(0, 162, 232, 0)', // чтобы были отдельные точки
          pointRadius: 2, // толще дефолтного
        }),
      );
    }

    if (calculatedData.length > 0) {
      cData.datasets.push(
        getGraph({
          data: calculatedData
            .map((elem) => ({ ...elem, y: elem.y + offsetCalc }))
            .sort((a, b) => a.x - b.x),
          yAxisID: 'waterLevel',
          label: LABELS.CALCULATED_DATA,
          color: COLOR_2,
        }),
      );
    }
    if (dataPrecipitation.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataPrecipitation.sort((a, b) => a.x - b.x),
          yAxisID: 'precipitation',
          label: LABELS.PRECIPITATION,
          color: COLOR_3,
        }),
      );
    }
    if (volumeData.length > 0) {
      cData.datasets.push(
        getGraph({
          data: volumeData.sort((a, b) => a.x - b.x),
          yAxisID: 'volume',
          label: LABELS.VOLUME,
          color: COLOR_4,
        }),
      );
    }
    if (wasteData.length > 0) {
      cData.datasets.push(
        getGraph({
          data: wasteData.sort((a, b) => a.x - b.x),
          yAxisID: 'waste',
          label: LABELS.WASTE,
          color: COLOR_5,
        }),
      );
    }

    return cData;
  }, [
    labels,
    data,
    calculatedData,
    dataPrecipitation,
    volumeData,
    wasteData,
    yAxisScaleMin,
    yAxisScaleMax,
    offsetCalc,
  ]);

  const chartScales: ScalesType = useMemo(() => {
    const scales: ScalesType = {
      x: {
        type: 'time',
        time: {
          tooltipFormat: TOOLTIP_FORMAT,
          unit: 'hour',
        },
        adapters: {
          date: {
            locale: ru,
          },
        },
        min: xAxisMin,
        max: xAxisMax,
        ticks: {
          callback(tickValue) {
            if (+tickValue % 10800 === 0) {
              const hours = new Date(tickValue).getHours();
              return `${hours < 10 ? '0' : ''}${hours}`;
            } else {
              return null;
            }
          },
        },
      },
      x1: {
        type: 'time',
        time: {
          unit: 'day',
        },
        min: xAxisMin,
        max: xAxisMax,
        ticks: {
          textStrokeWidth: 2,
        },
        adapters: {
          date: {
            locale: ru,
          },
        },
        grid: {
          color: 'black',
          lineWidth: (ctx) => {
            if (
              ctx.tick.value ===
              dayjs().set('h', 0).set('m', 0).set('s', 0).set('ms', 0).unix() * 1000
            ) {
              return 2;
            }
            return 1;
          },
        },
        border: {
          display: false,
        },
      },
    };
    if (data.length > 0 || calculatedData.length > 0) {
      const dataScale = calculateScale(
        Math.max(yAxisScaleMin, Math.min(yAxisDataMin, yAxisCalculatedDataMin)),
        Math.min(yAxisScaleMax, Math.max(yAxisDataMax, yAxisCalculatedDataMax)),
      );
      scales.waterLevel = {
        display: isShowWaterLevel,
        title: {
          display: true,
          text: `${LABELS.DATA}, ${UNITS.DATA}`,
          color: data.length > 0 ? COLOR_1 : COLOR_2,
        },
        min: dataScale.min,
        max: dataScale.max,
        ticks: {
          stepSize: dataScale.stepSize,
        },
      };
    }
    if (dataPrecipitation.length > 0) {
      const precipitationScale = calculateScale(yAxisPrecipitationMin, yAxisPrecipitationMax);
      scales.precipitation = {
        display: isShowPrecipitation,
        title: {
          display: true,
          text: `${LABELS.PRECIPITATION}, ${UNITS.PRECIPITATION}`,
          color: COLOR_3,
        },
        min: precipitationScale.min,
        max: precipitationScale.max,
        ticks: {
          stepSize: precipitationScale.stepSize,
        },
      };
    }
    if (volumeData.length > 0) {
      const volumeScale = calculateScale(yAxisVolumeMin, yAxisVolumeMax);
      scales.volume = {
        display: isShowVolume,
        title: {
          display: true,
          text: `${LABELS.VOLUME}, ${UNITS.VOLUME}`,
          color: COLOR_4,
        },
        min: volumeScale.min,
        max: volumeScale.max,
        ticks: {
          stepSize: volumeScale.stepSize,
        },
      };
    }
    if (wasteData.length > 0) {
      const wasteScale = calculateScale(yAxisWasteMin, yAxisWasteMax);
      scales.waste = {
        display: isShowWaste,
        title: {
          display: true,
          text: `${LABELS.WASTE}, ${UNITS.WASTE}`,
          color: COLOR_5,
        },
        min: wasteScale.min,
        max: wasteScale.max,
        ticks: {
          stepSize: wasteScale.stepSize,
        },
      };
    }

    return scales;
  }, [
    data,
    calculatedData,
    dataPrecipitation,
    volumeData,
    wasteData,
    xAxisMin,
    xAxisMax,
    yAxisScaleMin,
    yAxisScaleMax,

    yAxisCalculatedDataMax,
    yAxisCalculatedDataMin,
    yAxisDataMax,
    yAxisDataMin,
    yAxisPrecipitationMax,
    yAxisPrecipitationMin,
    yAxisVolumeMax,
    yAxisVolumeMin,
    yAxisWasteMax,
    yAxisWasteMin,

    isShowWaterLevel,
    isShowPrecipitation,
    isShowVolume,
    isShowWaste,
  ]);

  const chartOptions = useMemo(() => {
    return {
      clip: 3,
      maintainAspectRatio: false,
      scales: chartScales,
      plugins: {
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            mode: 'x' as const,
          },
          pan: {
            enabled: true,
            mode: 'x' as const,
          },
          limits: {
            x: {
              min: 'original' as const,
              max: 'original' as const,
            },
          },
        },
        legend: {
          onClick: (e, legendItem, chart) => {
            // Обрабатываем стандартное поведение клика
            const datasetIndex = legendItem.datasetIndex;
            const dataset = chart.chart.data.datasets[datasetIndex];
            dataset.hidden = !dataset.hidden;
            chart.chart.update();

            // Проверяем видимость графиков и скрываем/показываем шкалы
            const isDataHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.DATA,
            )?.hidden;

            const isCalculatedDataHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.CALCULATED_DATA,
            )?.hidden;
            setIsShowWaterLevel(
              (!isDataHidden && data.length > 0) ||
                (!isCalculatedDataHidden && calculatedData.length > 0),
            );

            const isPrecipitationHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.PRECIPITATION,
            )?.hidden;
            setIsShowPrecipitation(!isPrecipitationHidden);

            const isVolumeHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.VOLUME,
            )?.hidden;
            setIsShowVolume(!isVolumeHidden);

            const isWasteHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.WASTE,
            )?.hidden;
            setIsShowWaste(!isWasteHidden);

            chart.chart.update();
          },
        },
      },
    };
  }, [chartScales, data.length, calculatedData.length]);

  const downloadCsv = useCallback(() => {
    const dataDownload: TDataCsv = [];
    const pushData = (data: chartData, label: string) => {
      if (data.length > 0) {
        dataDownload.push({
          data: data,
          label: label,
        });
      }
    };
    pushData(data, `${LABELS.DATA} (${UNITS.DATA})`);
    pushData(calculatedData, `${LABELS.CALCULATED_DATA} (${UNITS.CALCULATED_DATA})`);
    pushData(dataPrecipitation, `${LABELS.PRECIPITATION} (${UNITS.PRECIPITATION})`);
    pushData(volumeData, `${LABELS.VOLUME} (${UNITS.VOLUME})`);
    pushData(wasteData, `${LABELS.WASTE} (${UNITS.WASTE})`);

    const csv = createCsv(dataDownload);
    if (!csv || dataDownload.length === 0) return;
    makeLinkCsv(
      csv,
      `hydropost_${selectedPointId}_${fromDate.format(FORMAT_DATE.SHORT)}-${toDate.format(
        FORMAT_DATE.SHORT,
      )}.csv`,
    );
  }, [
    data,
    calculatedData,
    dataPrecipitation,
    volumeData,
    wasteData,
    fromDate,
    toDate,
    selectedPointId,
  ]);

  const [step, setStep] = useState(0.1);

  return chartData.datasets.length > 0 ? (
    <div className={styles.chartWrapper}>
      <div className={styles.csvDownloadBtn} onClick={downloadCsv}>
        Скачать csv
      </div>
      <div
        style={{ cursor: 'pointer', marginBottom: 0, position: 'relative' }}
        onClick={resetChartHydropost}
      >
        <CloseCircleOutlined
          style={{ fontSize: 24, position: 'absolute', right: 0, top: 0 }}
        />
      </div>
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
      </div>

      <Chart type='line' data={chartData} options={chartOptions} />
    </div>
  ) : (
    <></>
  );
};
