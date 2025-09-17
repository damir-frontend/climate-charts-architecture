import { ru } from 'date-fns/locale';
import { useMemo } from 'react';
import { hydropostChartStore } from '../model';

import dayjs from '@dayjs';
import {
  COLOR_1,
  COLOR_2,
  COLOR_3,
  COLOR_4,
  COLOR_5,
  TOOLTIP_FORMAT,
} from 'app/entities/chart-utils/const';
import { calculateScale } from 'app/entities/chart-utils/utils';
import { LABELS, UNITS } from '../consts';
import { ScalesType } from '../types';

export const useChartScales = ({
  isShowWaterLevel,
  isShowPrecipitation,
  isShowVolume,
  isShowWaste,
}: {
  isShowWaterLevel: boolean;
  isShowPrecipitation: boolean;
  isShowVolume: boolean;
  isShowWaste: boolean;
}) => {
  const {
    data,
    calculatedData,
    dataPrecipitation,
    volumeData,
    wasteData,
    xAxisMin,
    xAxisMax,
    yAxisScaleMin,
    yAxisScaleMax,
    yAxisDataMin,
    yAxisDataMax,
    yAxisCalculatedDataMin,
    yAxisCalculatedDataMax,
    yAxisPrecipitationMin,
    yAxisPrecipitationMax,
    yAxisVolumeMin,
    yAxisVolumeMax,
    yAxisWasteMin,
    yAxisWasteMax,
  } = hydropostChartStore.getState();

  const scales = useMemo(() => {
    const internalScales: ScalesType = {
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
      internalScales.waterLevel = {
        type: 'linear',
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
      internalScales.precipitation = {
        type: 'linear',
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
      internalScales.volume = {
        type: 'linear',
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
      internalScales.waste = {
        type: 'linear',
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

    return internalScales;
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

  return scales;
};
