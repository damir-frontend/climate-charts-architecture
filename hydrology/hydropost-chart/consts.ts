export const LABELS = {
  DATA: 'Уровень воды',
  CALCULATED_DATA: 'Расчетный уровень воды',
  DATA_ID: 'waterLevel',
  PRECIPITATION: 'Количество осадков',
  VOLUME: 'Объем воды',
  WASTE: 'Расход воды',
} as const;

export const UNITS = {
  DATA: 'м',
  CALCULATED_DATA: 'м',
  PRECIPITATION: 'мм',
  VOLUME: 'млн.куб.м',
  WASTE: 'куб.м/с',
} as const;
