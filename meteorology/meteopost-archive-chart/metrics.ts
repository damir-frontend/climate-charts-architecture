import { COLOR_1, COLOR_2, COLOR_3 } from '@app/shared/charts/const';
import { prepareMetrics } from '@app/shared/charts/prepare-metrics';

export const METRICS = {
  TEMPERATURE_MIN: {
    label: 'Температура минимальная',
    unit: '°C',
    color: COLOR_1,
    axis: 'temperature',
  },
  TEMPERATURE_MAX: {
    label: 'Температура максимальная',
    unit: '°C',
    color: COLOR_2,
    axis: 'temperature',
  },
  PRECIPITATION: {
    label: 'Количество осадков',
    unit: 'мм',
    color: COLOR_3,
    axis: 'precipitation',
  },
} as const;

export const METRIC_AXES = {
  temperature: {
    label: 'Температура',
    unit: '°C',
    color: COLOR_1,
  },
  precipitation: {
    label: 'Количество осадков',
    unit: 'мм',
    color: COLOR_3,
  },
} as const;

export const {
  LABELS,
  UNITS,
  COLORS,
  LABEL_MAP,
  LABELS_AXIS,
  UNITS_AXIS,
  COLORS_AXIS,
  METRICS_AXIS_MAP,
  METRICS_BY_AXIS,
  METRIC_AXES_KEYS,
  METRIC_KEYS,
  METRIC_DEFINITIONS,
} = prepareMetrics(METRICS, METRIC_AXES);
