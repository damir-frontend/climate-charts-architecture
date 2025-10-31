import { FORMAT_DATE } from '@/utils';
import dayjs from '@dayjs';
import { logsApi } from 'app/shared/api';
import { fetchHydropostDataAtPeriod } from 'app/shared/api/hydrology';
import { toast } from 'react-toastify';
import create, { TStore } from 'utils/zustand';
import { fetchCalculatedCharts } from './api';
import { THydropostChartState } from './types';

const initialChartState = {
  isLoading: false,
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

export const hydropostChartStore: TStore<THydropostChartState> = create(
  (set, get) => ({
    ...initialChartState,
    resetGraph: () => set({ ...initialChartState }),
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
    setIsLoading(isLoading) {
      set({ isLoading });
    },
    fetchData: async ({ sid_id, from_dt, to_dt }) => {
      if (!sid_id) {
        set({ data: [] });
        return;
      }
      get().setIsLoading(true);
      get().abortController?.abort();
      const controller = new AbortController();
      set({ abortController: controller });
      const signal = controller.signal;

      try {
        const { data } = await fetchHydropostDataAtPeriod({ sid_id, from_dt, to_dt, signal });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (data && !data.error && data.dataset.length) {
          const yAxisDataMin = Math.min(...data.dataset.map((el) => el.y));
          const yAxisDataMax = Math.max(...data.dataset.map((el) => el.y));
          const yAxisScaleMin =
            Math.floor(Math.min(yAxisDataMin, get().yAxisCalculatedDataMin) * 10) / 10;
          const yAxisScaleMax =
            Math.ceil(Math.max(yAxisDataMax, get().yAxisCalculatedDataMax) * 10) / 10;
          logsApi.log_transaction({
            filename: `hydropostChart${sid_id}.json`,
            filesize: Math.round(new Blob([JSON.stringify(data)]).size / 1000),
            structure: 'json',
          });
          set({
            data: data.dataset,
            yAxisDataMin,
            yAxisDataMax,
            yAxisScaleMin,
            yAxisScaleMax,
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
          set({ data: [] });
          get().setWarningMessage('Данных об измерениях уровня воды нет');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Ошибка при загрузке fetchData:', err);
      } finally {
        get().setIsLoading(false);
      }
    },
    loadCalculatedCharts: async ({
      cm_id,
      from_dt,
      to_dt,
      source,
      showOptions,
      simulated,
      simulatedDuration,
      simulatedLevel,
      simulatedDate,
    }) => {
      if (!cm_id) {
        set({ wasteData: [], volumeData: [], dataPrecipitation: [], calculatedData: [] });
        return;
      }

      get().setIsLoading(true);
      get().abortController?.abort();
      const controller = new AbortController();
      set({ abortController: controller });
      const signal = controller.signal;

      try {
        const { data } = await fetchCalculatedCharts({
          cm_id,
          from_dt,
          to_dt,
          source,
          simulated,
          signal,
        });
        const chartsValues = data.body.charts;
        const wastes = chartsValues.map((value) => ({ y: value.waste, x: value.dt * 1000 }));
        const volumes = chartsValues.map((value) => ({
          y: Math.round(value.volume / 1000) / 1000,
          x: value.dt * 1000,
        }));

        const precipitations = chartsValues.map((value) => ({
          y: value.precipitation,
          x: value.dt * 1000,
        }));

        if (simulated && simulatedDuration && simulatedLevel && simulatedDate) {
          const count = precipitations.filter(
            (e) =>
              e.x <= simulatedDate.unix() * 1000 &&
              e.x >= simulatedDate.unix() * 1000 - simulatedDuration * 60 * 60 * 1000,
          ).length;

          precipitations.forEach((e, i) => {
            if (
              e.x <= simulatedDate.unix() * 1000 &&
              e.x >= simulatedDate.unix() * 1000 - simulatedDuration * 60 * 60 * 1000
            )
              e.y = e.y + simulatedLevel / count;
          });
        }

        const levels = chartsValues.map((value) => ({
          y: value.level,
          x: value.dt * 1000,
        }));

        const yAxisCalculatedDataMin = Math.min(...levels.map((el) => el.y));
        const yAxisCalculatedDataMax = Math.max(...levels.map((el) => el.y));
        const yAxisScaleMin =
          Math.floor(Math.min(yAxisCalculatedDataMin, get().yAxisDataMin) * 10) / 10;
        const yAxisScaleMax =
          Math.ceil(Math.max(yAxisCalculatedDataMax, get().yAxisDataMax) * 10) / 10;
        const yAxisPrecipitationMax = Math.max(...precipitations.map((el) => el.y));
        const yAxisPrecipitationMin = Math.min(...precipitations.map((el) => el.y));
        const yAxisVolumeMax = Math.max(...volumes.map((el) => el.y));
        const yAxisVolumeMin = Math.min(...volumes.map((el) => el.y));
        const yAxisWasteMax = Math.max(...wastes.map((el) => el.y));
        const yAxisWasteMin = Math.min(...wastes.map((el) => el.y));

        set({
          wasteData: showOptions.waste ? wastes : [],
          volumeData: showOptions.volume ? volumes : [],
          dataPrecipitation: showOptions.precipitation ? precipitations : [],
          calculatedData: showOptions.level ? levels : [],
          yAxisCalculatedDataMin,
          yAxisCalculatedDataMax,
          yAxisScaleMin,
          yAxisScaleMax,
          yAxisPrecipitationMax,
          yAxisPrecipitationMin,
          yAxisVolumeMax,
          yAxisVolumeMin,
          yAxisWasteMax,
          yAxisWasteMin,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        toast.error(err.message || 'Непредвиденная ошибка');
        set({ wasteData: [], volumeData: [], dataPrecipitation: [], calculatedData: [] });
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
