import { TChartData } from '@app/shared/charts/const';
import { ChartScaleOptions } from '@app/shared/charts/types';

export type ScalesType = {
  x: ChartScaleOptions;
  x1: ChartScaleOptions;
  temperature?: ChartScaleOptions;
  precipitation?: ChartScaleOptions;
};

export type TMeteopostArchiveChartState = {
  data: {
    TEMPERATURE_MIN: TChartData;
    TEMPERATURE_MAX: TChartData;
    PRECIPITATION: TChartData;
  };
  offsetCalc: number;
  setOffsetCalc: (offsetCalc: number) => void;
  labels: number[];
  loadMeteopostArchiveData: ({ sid_id }: { sid_id: number }) => Promise<void>;
  resetGraph: () => void;
  visible: boolean;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  warningMessage: string;
  setWarningMessage: (message: string) => void;
  setLabels: (labels: number[]) => void;
  setVisible: (value: boolean) => void;
  isLoadingMeteopostArchive: boolean;
};
