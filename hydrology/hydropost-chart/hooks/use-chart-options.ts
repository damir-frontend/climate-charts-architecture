import { ChartOptions } from 'chart.js';
import { useMemo, useState } from 'react';
import { LABELS, METRICS } from '../consts';
import { hydropostChartStore } from '../model';
import { DatasetType } from '../types';
import { useChartScales } from './use-chart-scales';

export const useChartOptions = (): ChartOptions<DatasetType> => {
  const [isShowWaterLevel, setIsShowWaterLevel] = useState(true);
  const [isShowPrecipitation, setIsShowPrecipitation] = useState(true);
  const [isShowVolume, setIsShowVolume] = useState(true);
  const [isShowWaste, setIsShowWaste] = useState(true);

  const chartScales = useChartScales({
    isShowWaterLevel,
    isShowPrecipitation,
    isShowVolume,
    isShowWaste,
  });

  const data = hydropostChartStore((state) => state.data);
  const calculatedData = hydropostChartStore((state) => state.calculatedData);

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
  }, [
    chartScales,
    data.length,
    calculatedData.length,
    setIsShowPrecipitation,
    setIsShowVolume,
    setIsShowWaste,
    setIsShowWaterLevel,
  ]);
};
