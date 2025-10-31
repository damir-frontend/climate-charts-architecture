import { METRICS } from './metrics';

export type MetricKey = keyof typeof METRICS; //  'TEMPERATURE_MIN' | 'TEMPERATURE_MAX' | 'PRECIPITATION'
export type MetricDefinition = (typeof METRICS)[MetricKey]; // единичная запись
export type MetricAxis = MetricDefinition['axis']; // 'temperature' | 'precipitation'
export const metricKeys = Object.keys(METRICS) as MetricKey[]; // ("TEMPERATURE_MIN" | "TEMPERATURE_MAX" | "PRECIPITATION")[]
