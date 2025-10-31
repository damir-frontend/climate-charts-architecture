import { CloseCircleOutlined } from '@ant-design/icons';
import {
  chartData,
  COLOR_1,
  COLOR_2,
  COLOR_3,
  namesOfMonth,
  TDataCsv,
  TOOLTIP_FORMAT,
} from 'app/entities/chart-utils/const';
import {
  calculateScale,
  createCsv,
  getGraph,
  makeLinkCsv,
} from 'app/entities/chart-utils/utils';
import { workPointStore } from 'app/entities/work-point/model';
import { checkMeteopostArchive } from 'app/entities/work-point/operating-point/utils';
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
import { useCallback, useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import { visibleGraphStore } from '../visible-graph-store/model';
import { LABELS, UNITS } from './consts';
import { meteopostArchiveChartStore } from './model';
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
  temperature?: object | null;
  precipitation?: object | null;
};

export const MeteopostArchiveChart = () => {
  // const data = meteopostChartStore((state) => state.data);
  const selectedPointId = workPointStore((state) => state.selectedId);
  const mapPoints = workPointStore((state) => state.mapPoints);
  // ? разобраться с типами. всё равно в checkMeteopostArchive передавать null нельзя
  const selectedPoint = selectedPointId ? mapPoints.get(selectedPointId) : null;

  const resetGraph = visibleGraphStore((state) => state.resetGraph);

  const isLoading = meteopostArchiveChartStore((state) => state.isLoading);

  const dataTemperatureMin = meteopostArchiveChartStore((state) => state.dataTemperatureMin);
  const dataTemperatureMax = meteopostArchiveChartStore((state) => state.dataTemperatureMax);
  const dataPrecipitation = meteopostArchiveChartStore((state) => state.dataPrecipitation);
  const labels = meteopostArchiveChartStore((state) => state.labels);
  const xAxisMin = meteopostArchiveChartStore((state) => state.xAxisMin);
  const xAxisMax = meteopostArchiveChartStore((state) => state.xAxisMax);

  const yTemperatureMin = meteopostArchiveChartStore((state) => state.yTemperatureMin);
  const yTemperatureMax = meteopostArchiveChartStore((state) => state.yTemperatureMax);
  const yPrecipitationMin = meteopostArchiveChartStore((state) => state.yPrecipitationMin);
  const yPrecipitationMax = meteopostArchiveChartStore((state) => state.yPrecipitationMax);

  const chartData = useMemo(() => {
    const cData: ChartData<'line'> = { datasets: [], labels };
    if (dataTemperatureMin.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataTemperatureMin,
          yAxisID: 'temperature',
          label: LABELS.TEMPERATURE_MIN,
          color: COLOR_1,
        }),
      );
    }
    if (dataTemperatureMax.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataTemperatureMax,
          yAxisID: 'temperature',
          label: LABELS.TEMPERATURE_MAX,
          color: COLOR_2,
        }),
      );
    }
    if (dataPrecipitation.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataPrecipitation,
          yAxisID: 'precipitation',
          label: LABELS.PRECIPITATION,
          color: COLOR_3,
        }),
      );
    }

    return cData;
  }, [labels, dataTemperatureMin, dataTemperatureMax, dataPrecipitation]);

  const chartScales: ScalesType = useMemo(() => {
    const scales: ScalesType = {
      x: {
        type: 'time',
        time: {
          tooltipFormat: TOOLTIP_FORMAT,
          unit: 'month',
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
            const month = new Date(tickValue).getMonth();
            if (month % 6 === 0) {
              return `${namesOfMonth[month]}`;
            } else {
              return null;
            }
          },
        },
      },
      x1: {
        type: 'time',
        time: {
          unit: 'year',
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
    if (dataTemperatureMin.length > 0) {
      const temperatureScale = calculateScale(yTemperatureMin, yTemperatureMax);
      scales.temperature = {
        min: temperatureScale.min,
        max: temperatureScale.max,
        title: {
          display: true,
          text: `${LABELS.TEMPERATURE_SCALE}, ${UNITS.TEMPERATURE_SCALE}`,
          color: COLOR_1,
        },
        ticks: {
          stepSize: temperatureScale.stepSize,
        },
      };
    }

    if (dataPrecipitation.length > 0) {
      const precipitationScale = calculateScale(yPrecipitationMin, yPrecipitationMax);
      scales.precipitation = {
        min: precipitationScale.min,
        max: precipitationScale.max,
        title: {
          display: true,
          text: `${LABELS.PRECIPITATION}, ${UNITS.PRECIPITATION}`,
          color: COLOR_3,
        },
        ticks: {
          stepSize: precipitationScale.stepSize,
        },
      };
    }

    return scales;
  }, [
    dataTemperatureMin,
    dataPrecipitation,

    xAxisMax,
    xAxisMin,
    yTemperatureMin,
    yTemperatureMax,
    yPrecipitationMin,
    yPrecipitationMax,
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
            const isTemperatureMinHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.TEMPERATURE_MIN,
            )?.hidden;

            const isTemperatureMaxHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.TEMPERATURE_MAX,
            )?.hidden;

            const isPrecipitationHidden = chart.chart.data.datasets.find(
              (ds) => ds.label === LABELS.PRECIPITATION,
            )?.hidden;

            // Если данные в графике скрыты, скрываем шкалу данных
            if (chart.chart.options.scales.temperature) {
              chart.chart.options.scales.temperature.display =
                !isTemperatureMinHidden || !isTemperatureMaxHidden;
            }
            if (chart.chart.options.scales.precipitation) {
              chart.chart.options.scales.precipitation.display = !isPrecipitationHidden;
            }

            chart.chart.update();
          },
        },
      },
    };
  }, [chartScales]);

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
    pushData(dataTemperatureMin, `${LABELS.TEMPERATURE_MIN} (${UNITS.TEMPERATURE_MIN})`);
    pushData(dataTemperatureMax, `${LABELS.TEMPERATURE_MAX} (${UNITS.TEMPERATURE_MAX})`);
    pushData(dataPrecipitation, `${LABELS.PRECIPITATION} (${UNITS.PRECIPITATION})`);

    const csv = createCsv(dataDownload);
    if (!csv || dataDownload.length === 0) return;
    makeLinkCsv(csv, `meteopost-archive_${selectedPointId}.csv`);
  }, [dataTemperatureMin, dataTemperatureMax, dataPrecipitation, selectedPointId]);

  return (
    <div className={styles.meteoinfoCharts}>
      <div className={styles.chartWrapper}>
        {chartData.datasets.length > 0 ? (
          <div className={styles.csvDownloadBtn} onClick={downloadCsv}>
            Скачать csv
          </div>
        ) : (
          <></>
        )}
        <div
          style={{ cursor: 'pointer', marginBottom: 0, position: 'relative' }}
          onClick={resetGraph}
        >
          <CloseCircleOutlined
            style={{ fontSize: 24, position: 'absolute', right: 0, top: 0 }}
          />
        </div>

        {checkMeteopostArchive(selectedPoint) ? (
          chartData.datasets.length > 0 ? (
            <Chart type='line' data={chartData} options={chartOptions} />
          ) : (
            <div className={styles.nodataContainer}>
              {isLoading ? (
                <div className={styles.nodataMessage}>Загрузка данных...</div>
              ) : (
                <div className={styles.nodataMessage}>Нет данных</div>
              )}
            </div>
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
