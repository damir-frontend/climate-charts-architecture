import { COLOR_1, COLOR_2 } from '@app/shared/charts/const';
import { prepareMetrics } from '@app/shared/charts/prepare-metrics';

export const METRICS = {
  FLOW: {
    label: 'Расход воды',
    unit: 'ед.',
    color: COLOR_1,
    axis: 'flow',
  },
  LEVEL: {
    label: 'Уровень воды',
    unit: 'ед.',
    color: COLOR_2,
    axis: 'level',
  },
} as const;

export const METRIC_AXES = {
  flow: {
    label: 'Расход воды',
    unit: 'ед.',
    color: COLOR_1,
  },
  level: {
    label: 'Уровень воды',
    unit: 'ед.',
    color: COLOR_2,
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
