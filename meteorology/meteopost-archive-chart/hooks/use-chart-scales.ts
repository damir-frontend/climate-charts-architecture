import { ru } from 'date-fns/locale';
import { useMemo } from 'react';
import { meteopostArchiveChartStore } from '../model';

import dayjs from '@dayjs';
import {
  COLOR_1,
  COLOR_3,
  namesOfMonth,
  TOOLTIP_FORMAT,
} from 'app/entities/chart-utils/const';
import { calculateScale } from 'app/entities/chart-utils/utils';
import { LABELS, UNITS } from '../consts';
import { ScalesType } from '../types';

export const useChartScales = () => {
  const {
    dataTemperatureMin,
    dataPrecipitation,
    xAxisMin,
    xAxisMax,
    yTemperatureMin,
    yTemperatureMax,
    yPrecipitationMin,
    yPrecipitationMax,
  } = meteopostArchiveChartStore((state) => state);

  const scales = useMemo(() => {
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
        type: 'linear',
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
        type: 'linear',
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

  return scales;
};
