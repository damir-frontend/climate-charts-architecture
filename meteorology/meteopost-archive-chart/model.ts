import dayjs from '@dayjs';
import { draggableMenuLoaderStore } from 'app/entities/draggable-menu/loader/model';
import { getMeteopostArchiveData } from 'app/shared/api/meteorology';
import create, { TStore } from 'utils/zustand';
import { TMeteopostArchiveChartState } from './types';

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
  isLoadingMeteopostArchive: false,
};

export const meteopostArchiveChartStore: TStore<TMeteopostArchiveChartState> = create(
  (set) => ({
    ...initialChartState,
    resetGraph: () => set({ ...initialChartState }),
    setVisible: (value) => set({ visible: value }),
    setLabels: (labels) => set({ labels }),
    setOffsetCalc: (offsetCalc) => set({ offsetCalc }),
    setDataTemperatureMin: (dataTemperatureMin) => set({ dataTemperatureMin }),
    setDataTemperatureMax: (dataTemperatureMax) => set({ dataTemperatureMax }),
    setDataPrecipitation: (dataPrecipitation) => set({ dataPrecipitation }),
    setWarningMessage: (message) => set({ warningMessage: message }),
    loadMeteopostArchiveData: async ({ sid_id }) => {
      const setDraggableMenuLoading =
        draggableMenuLoaderStore.getState().setDraggableMenuLoading;
      try {
        setDraggableMenuLoading(true);
        set({ isLoadingMeteopostArchive: true });
        const { data } = await getMeteopostArchiveData({ sid_id });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (data && !data.error) {
          const dataConverted = data
            .map((el) =>
              Object.assign(el, {
                dt: +el.dt * 1000,
                t_min: Math.round(+el.t_min * 1000) / 1000,
                t_max: Math.round(+el.t_max * 1000) / 1000,
                precip_mean: Math.round(+el.precip_mean * 1000) / 1000,
              }),
            )
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
          });
        } else {
          set({
            dataTemperatureMin: [],
            dataTemperatureMax: [],
            dataPrecipitation: [],
            xAxisMax: 0,
            xAxisMin: 0,
          });
        }
      } catch (err) {
        console.log(err);
      } finally {
        setDraggableMenuLoading(false);
        set({ isLoadingMeteopostArchive: false });
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
