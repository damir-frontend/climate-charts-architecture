import { chartData } from 'app/entities/chart-utils/const';
import { getMeteopostArchiveData } from 'app/shared/api/meteorology';
import dayjs from 'dayjs';
import create, { TStore } from 'utils/zustand';

const initialChartState = {
  dataTemperatureMin: [],
  dataTemperatureMax: [],
  dataPrecipitation: [],
  labels: [],
  offsetCalc: 0,
  errorMessage: '',
  warningMessage: '',
  visible: false,
  yTemperatureMin: 0,
  yTemperatureMax: 0,
  yPrecipitationMin: 0,
  yPrecipitationMax: 0,
  xAxisMax: 0,
  xAxisMin: 0,
  yAxisMin: 0,
  yAxisMax: 0,
  isLoading: false,
};

type TMeteopostArchiveChartState = {
  dataTemperatureMin: chartData;
  dataTemperatureMax: chartData;
  dataPrecipitation: chartData;
  offsetCalc: number;
  setOffsetCalc: (offsetCalc: number) => void;
  setDataTemperatureMin: (data: chartData) => void;
  setDataTemperatureMax: (data: chartData) => void;
  setDataPrecipitation: (data: chartData) => void;
  labels: number[];
  fetchMeteopostArchiveData: ({ sid_id }: { sid_id: number }) => void;
  resetChart: () => void;
  visible: boolean;
  yTemperatureMin: number;
  yTemperatureMax: number;
  yPrecipitationMin: number;
  yPrecipitationMax: number;
  xAxisMin: number;
  xAxisMax: number;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  warningMessage: string;
  setWarningMessage: (message: string) => void;
  setLabels: (labels: number[]) => void;
  setVisible: (value: boolean) => void;
  isLoading: boolean;
};

export const meteopostArchiveChartStore: TStore<TMeteopostArchiveChartState> = create(
  (set) => ({
    ...initialChartState,
    resetChart: () => set({ ...initialChartState }),
    setVisible: (value) => set({ visible: value }),
    setLabels: (labels) => set({ labels }),
    setOffsetCalc: (offsetCalc) => set({ offsetCalc }),
    setDataTemperatureMin: (dataTemperatureMin) => set({ dataTemperatureMin }),
    setDataTemperatureMax: (dataTemperatureMax) => set({ dataTemperatureMax }),
    setDataPrecipitation: (dataPrecipitation) => set({ dataPrecipitation }),
    setWarningMessage: (message) => set({ warningMessage: message }),
    fetchMeteopostArchiveData: async ({ sid_id }) => {
      try {
        set({ isLoading: true });
        const { data } = await getMeteopostArchiveData({ sid_id });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (data && !data.error) {
          const dataConverted = data
            .map((el) => Object.assign(el, { dt: +el.dt * 1000 }))
            .sort((a, b) => dayjs(a.dt).diff(dayjs(b.dt)));
          set({
            dataTemperatureMin: dataConverted.map((el) => ({ x: el.dt, y: el.t_min })),
            dataTemperatureMax: dataConverted.map((el) => ({ x: el.dt, y: el.t_max })),
            dataPrecipitation: dataConverted.map((el) => ({ x: el.dt, y: el.precip_mean })),
            yTemperatureMin: Math.min(...dataConverted.map((el) => el.t_min)),
            yTemperatureMax: Math.max(...dataConverted.map((el) => el.t_max)),
            yPrecipitationMin: Math.min(...dataConverted.map((el) => el.precip_mean)),
            yPrecipitationMax: Math.max(...dataConverted.map((el) => el.precip_mean)),
            errorMessage:
              data.length === 0 || dataConverted.length === 0
                ? `Отсутствуют данные для архивного метеопоста ${sid_id}`
                : '',
            isLoading: false,
          });
        } else {
          set({
            dataTemperatureMin: [],
            dataTemperatureMax: [],
            dataPrecipitation: [],
            xAxisMax: 0,
            xAxisMin: 0,
            isLoading: false,
          });
        }
      } catch (err) {
        console.log(err);
        set({ isLoading: false });
      }
    },
    setErrorMessage: (message) => set({ errorMessage: message }),
  }),
  [
    (state) => state.labels,
    (labels) =>
      meteopostArchiveChartStore.setState({
        visible: labels.length > 0,
        xAxisMax: labels[labels.length - 1],
        xAxisMin: labels[0],
      }),
  ],
);
