export const METRICS = {
  DATA: {
    label: 'Уровень воды',
    unit: 'м',
  },
  CALCULATED_DATA: {
    label: 'Расчетный уровень воды',
    unit: 'м',
  },
  PRECIPITATION: {
    label: 'Количество осадков',
    unit: 'мм',
  },
  VOLUME: {
    label: 'Объем воды',
    unit: 'млн.куб.м',
  },
  WASTE: {
    label: 'Расход воды',
    unit: 'куб.м/с',
  },
} as const;

export const LABELS = Object.fromEntries(
  Object.entries(METRICS).map(([key, value]) => [key, value.label]),
) as Record<keyof typeof METRICS, string>;

export const UNITS = Object.fromEntries(
  Object.entries(METRICS).map(([key, value]) => [key, value.unit]),
) as Record<keyof typeof METRICS, string>;
