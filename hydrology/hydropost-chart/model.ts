import { axios, FORMAT_DATE } from '@/utils';
import { IPConfig } from '@root/ip_config';
import { chartData } from 'app/entities/chart-utils/const';
import { logsApi } from 'app/shared/api';
import { getHydropostDataAtPeriod } from 'app/shared/api/hydrology';
import { TMeteodataSource } from 'app/utils/const';
import dayjs from 'dayjs';
import create, { TStore } from 'utils/zustand';

const initialChartState = {
  data: [],
  calculatedData: [],
  dataPrecipitation: [],
  volumeData: [],
  wasteData: [],
  labels: [],
  offsetCalc: 0,
  errorMessage: '',
  warningMessage: '',
  visible: false,
  xAxisMax: 0,
  xAxisMin: 0,
  yAxisScaleMin: Infinity,
  yAxisScaleMax: -Infinity,
  yAxisDataMin: Infinity,
  yAxisDataMax: -Infinity,
  yAxisCalculatedDataMin: 0,
  yAxisCalculatedDataMax: 0,
  yAxisPrecipitationMin: 0,
  yAxisPrecipitationMax: 0,
  yAxisVolumeMin: 0,
  yAxisVolumeMax: 0,
  yAxisWasteMin: 0,
  yAxisWasteMax: 0,
};

type THydropostChartState = {
  data: chartData;
  setData: (data: chartData) => void;
  offsetCalc: number;
  setOffsetCalc: (offsetCalc: number) => void;
  calculatedData: chartData;
  setCalculatedData: (data: chartData) => void;
  dataPrecipitation: chartData;
  setPrecipitationData: (data: chartData) => void;
  volumeData: chartData;
  setVolumeData: (data: chartData) => void;
  wasteData: chartData;
  setWasteData: (data: chartData) => void;
  labels: number[];
  fetchData: ({
    sid_id,
    from_dt,
    to_dt,
  }: {
    sid_id: number;
    from_dt: number;
    to_dt: number;
  }) => void;
  fetchCalculatedData: ({
    cm_id,
    coordinates,
    from_dt,
    to_dt,
    source,
  }: {
    cm_id?: number;
    coordinates?: [number, number];
    source: TMeteodataSource;
    from_dt: number;
    to_dt: number;
  }) => void;
  fetchPrecipitationData: ({
    cm_id,
    from_dt,
    to_dt,
    source,
  }: {
    cm_id: number;
    source: TMeteodataSource;
    from_dt: number;
    to_dt: number;
  }) => void;
  fetchVolumeData: ({
    cm_id,
    from_dt,
    to_dt,
    source,
  }: {
    cm_id?: number;
    source: TMeteodataSource;
    from_dt: number;
    to_dt: number;
  }) => void;
  fetchWasteData: ({
    cm_id,
    from_dt,
    to_dt,
    source,
  }: {
    cm_id?: number;
    source: TMeteodataSource;
    from_dt: number;
    to_dt: number;
  }) => void;
  resetChart: () => void;
  visible: boolean;
  // Может быть такое, что в начале или конце массива нет измерений.
  // Используются, чтобы график рисовался в заданных временных рамках
  xAxisMin: number;
  xAxisMax: number;
  yAxisScaleMin: number;
  yAxisScaleMax: number;
  yAxisDataMin: number;
  yAxisDataMax: number;
  yAxisCalculatedDataMin: number;
  yAxisCalculatedDataMax: number;
  yAxisPrecipitationMin: number;
  yAxisPrecipitationMax: number;
  yAxisVolumeMin: number;
  yAxisVolumeMax: number;
  yAxisWasteMin: number;
  yAxisWasteMax: number;
  setYAxisScaleMin: (value: number) => void;
  setYAxisScaleMax: (value: number) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  warningMessage: string;
  setWarningMessage: (message: string) => void;
  setLabels: (labels: number[]) => void;
  setVisible: (value: boolean) => void;
};

export const hydropostChartStore: TStore<THydropostChartState> = create(
  (set, get) => ({
    ...initialChartState,
    resetChart: () => set({ ...initialChartState }),
    setVisible: (value) => set({ visible: value }),
    setLabels: (labels) => set({ labels }),
    setData: (data) => set({ data }),
    setCalculatedData: (data) => set({ calculatedData: data }),
    setOffsetCalc: (offsetCalc) => set({ offsetCalc }),
    setPrecipitationData: (data) => set({ dataPrecipitation: data }),
    setVolumeData: (data) => set({ volumeData: data }),
    setWasteData: (data) => set({ wasteData: data }),
    setWarningMessage: (message) => set({ warningMessage: message }),
    setYAxisScaleMin: (value: number) => set({ yAxisScaleMin: value }),
    setYAxisScaleMax: (value: number) => set({ yAxisScaleMax: value }),
    fetchData: async ({ sid_id, from_dt, to_dt }) => {
      try {
        const { data } = await getHydropostDataAtPeriod({ sid_id, from_dt, to_dt });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (data && !data.error && data.dataset.length) {
          const min = Math.min(...data.dataset.map((el) => el.y));
          const max = Math.max(...data.dataset.map((el) => el.y));
          logsApi.log_transaction({
            filename: `hydropostChart${sid_id}.json`,
            filesize: Math.round(new Blob([JSON.stringify(data)]).size / 1000),
            structure: 'json',
          });
          set({
            data: data.dataset,
            yAxisDataMin: min,
            yAxisDataMax: max,
            yAxisScaleMin: Math.floor(Math.min(min, get().yAxisCalculatedDataMin) * 10) / 10,
            yAxisScaleMax: Math.ceil(Math.max(max, get().yAxisCalculatedDataMax) * 10) / 10,
            errorMessage:
              data.dataset.length === 0
                ? `Отсутствуют данные об измерениях уровня воды на период с ${dayjs(
                    from_dt * 1000,
                  ).format(FORMAT_DATE.SHORT)} по ${dayjs(to_dt * 1000).format(
                    FORMAT_DATE.SHORT,
                  )}`
                : '',
          });
        } else {
          set({ data: [], xAxisMax: 0, xAxisMin: 0 });
          get().setWarningMessage('Данных об измерениях уровня воды нет');
        }
      } catch (err) {
        console.log(err);
      }
    },
    fetchCalculatedData: async ({ cm_id, from_dt, to_dt, source, coordinates }) => {
      if (cm_id) {
        try {
          // ? типы данных прописать
          const { data } = await axios.post(`${IPConfig.API_URL}srtm/calcLevel/hydropost`, {
            cm_id,
            from_dt,
            to_dt,
            source,
          });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (data && !data.error && data.dataset.length) {
            const min = Math.min(...data.dataset.map((el) => el.y));
            const max = Math.max(...data.dataset.map((el) => el.y));

            set({
              calculatedData: data.dataset,
              yAxisCalculatedDataMin: min,
              yAxisCalculatedDataMax: max,
              yAxisScaleMin: Math.floor(Math.min(min, get().yAxisDataMin) * 10) / 10,
              yAxisScaleMax: Math.ceil(Math.max(max, get().yAxisDataMax) * 10) / 10,
            });
          } else {
            set({ calculatedData: [] });
            get().setWarningMessage('Расчетных данных нет');
          }
        } catch (err) {
          console.log(err);
        }
      } else if (coordinates) {
        try {
          const { data } = await axios.post(`${IPConfig.API_URL}srtm/calcLevel`, {
            coordinates,
            from_dt,
            to_dt,
            source,
          });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (data && !data.error && data.dataset.length) {
            set({
              calculatedData: data.dataset,
              yAxisCalculatedDataMax: Math.max(...data.dataset.map((el) => el.y)),
              yAxisCalculatedDataMin: Math.min(...data.dataset.map((el) => el.y)),
            });
          } else {
            set({ calculatedData: [] });
            get().setWarningMessage('Расчетных данных нет');
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    fetchPrecipitationData: async ({ cm_id, from_dt, to_dt, source }) => {
      try {
        const { data } = await axios.post(`${IPConfig.API_URL}srtm/calcLevel/precipitation`, {
          cm_id,
          from_dt,
          to_dt,
          source,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (data && !data.error && data.dataset.length) {
          set({
            dataPrecipitation: data.dataset,
            yAxisPrecipitationMax: Math.max(...data.dataset.map((el) => el.y)),
            yAxisPrecipitationMin: Math.min(...data.dataset.map((el) => el.y)),
          });
        } else {
          set({ dataPrecipitation: [] });
          get().setWarningMessage('Данных осадков нет');
        }
      } catch (err) {
        console.log(err);
      }
    },
    fetchVolumeData: async ({ cm_id, from_dt, to_dt, source }) => {
      if (cm_id) {
        try {
          const { data } = await axios.post(`${IPConfig.API_URL}srtm/calcLevel/volume`, {
            cm_id,
            from_dt,
            to_dt,
            source,
          });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (data && !data.error && data.dataset.length) {
            set({
              volumeData: data.dataset.map((el) => Object.assign(el, { y: el.y / 1_000_000 })),
              yAxisVolumeMax: Math.max(...data.dataset.map((el) => el.y)),
              yAxisVolumeMin: Math.min(...data.dataset.map((el) => el.y)),
            });
          } else {
            set({ volumeData: [] });
            get().setWarningMessage('Данных объема воды нет');
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    fetchWasteData: async ({ cm_id, from_dt, to_dt, source }) => {
      if (cm_id) {
        try {
          const { data } = await axios.post(`${IPConfig.API_URL}srtm/calcLevel/waste`, {
            cm_id,
            from_dt,
            to_dt,
            source,
          });
          console.log(data);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (data && !data.error && data.dataset.length) {
            set({
              wasteData: data.dataset,
              yAxisWasteMax: Math.max(...data.dataset.map((el) => el.y)),
              yAxisWasteMin: Math.min(...data.dataset.map((el) => el.y)),
            });
          } else {
            set({ wasteData: [] });
            get().setWarningMessage('Данных расхода воды нет');
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    setErrorMessage: (message) => set({ errorMessage: message }),
  }),
  [
    (state) => state.labels,
    (labels) =>
      hydropostChartStore.setState({
        visible: labels.length > 0,
        xAxisMax: labels[labels.length - 1],
        xAxisMin: labels[0],
      }),
  ],
);
