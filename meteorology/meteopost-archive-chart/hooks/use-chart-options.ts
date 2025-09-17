import { ChartOptions } from 'chart.js';
import { useMemo } from 'react';

import { DatasetType } from 'app/entities/hydrology/hydropost-chart';
import { METRICS } from 'app/entities/hydrology/hydropost-chart/consts';
import { LABELS } from '../consts';
import { useChartScales } from './use-chart-scales';

type ScalesType = {
  x: object;
  x1: object;
  temperature?: object | null;
  precipitation?: object | null;
};

export const useChartOptions = (): ChartOptions<DatasetType> => {
  const chartScales: ScalesType = useChartScales();

  return useMemo(() => {
    return {
      clip: 3,
      maintainAspectRatio: false,
      scales: chartScales,
      plugins: {
        crosshair: {
          line: {
            color: 'rgba(0,0,0,0.6)', // цвет вертикальной линии
            width: 1,
          },
          sync: {
            enabled: false, // если не нужно синхронизировать несколько графиков
          },
          zoom: {
            enabled: false,
          },
          snap: {
            enabled: true, // подсказки будут привязаны к ближайшей точке
          },
          sync: {
            enabled: false,
          },
          callbacks: {
            beforeDraw: () => {},
            afterDraw: () => {},
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const entry = Object.values(METRICS).find((m) => m.label === label);
              if (!entry) return `${label}: ${context.parsed.y}`;
              return `${entry.label}: ${context.parsed.y} ${entry.unit}`;
            },
          },
        },
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
};
