import { METRICS } from './metrics';

export type MetricKey = keyof typeof METRICS; // 'FLOW' | 'LEVEL'
export type MetricDefinition = (typeof METRICS)[MetricKey]; // единичная запись
export type MetricAxis = MetricDefinition['axis']; // 'flow' | 'level'
export const metricKeys = Object.keys(METRICS) as MetricKey[]; // ("FLOW" | "LEVEL")[]
