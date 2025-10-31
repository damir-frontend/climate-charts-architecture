import { TChartData } from '@app/shared/charts/const';
import { ChartScaleOptions } from '@app/shared/charts/types';
import { TRGBAColor } from '@app/shared/charts/utils';

export type MetricType = { label: string; unit: string; color: TRGBAColor; axis?: any };
export type MetricsType = Record<string, MetricType>;
export type MetricsMapType = Map<string, MetricType>;

export type ScalesType = {
  x: ChartScaleOptions;
  x1: ChartScaleOptions;
  flow?: ChartScaleOptions;
  level?: ChartScaleOptions;
};

export type THydropostArchiveChartState = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  offsetCalc: number;
  setOffsetCalc: (offsetCalc: number) => void;
  data: {
    FLOW: TChartData;
    LEVEL: TChartData;
  };
  labels: number[];
  loadHydropostArchiveData: ({ sid_id }: { sid_id: number }) => Promise<void>;
  resetGraph: () => void;
  visible: boolean;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  warningMessage: string;
  setWarningMessage: (message: string) => void;
  setLabels: (labels: number[]) => void;
  setVisible: (value: boolean) => void;
  abortController?: AbortController;
};
