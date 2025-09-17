import { draggableMenuLoaderStore } from '@app/entities/draggable-menu/loader/model';
import { fetchMeteopostArchiveData } from '@app/shared/api/charts/fetch-meteopost-archive-data';
import { create, TStore } from '@utils';
import { TMeteopostArchiveChartState } from './types';
import { hasPrecipMean, hasTMax, hasTMin } from './utils';

const initialChartState = {
  data: {
    TEMPERATURE_MIN: [],
    TEMPERATURE_MAX: [],
    PRECIPITATION: [],
  },
  labels: [],
  offsetCalc: 0,
  errorMessage: '',
  warningMessage: '',
  visible: false,
  isLoadingMeteopostArchive: false,
};

export const meteopostArchiveChartStore: TStore<TMeteopostArchiveChartState> = create(
  (set) => ({
    ...initialChartState,
    resetGraph: () => set({ ...initialChartState }),
    setVisible: (value) => set({ visible: value }),
    setLabels: (labels) => set({ labels }),
    setOffsetCalc: (offsetCalc) => set({ offsetCalc }),
    setWarningMessage: (message) => set({ warningMessage: message }),
    loadMeteopostArchiveData: async ({ sid_id }) => {
      const setDraggableMenuLoading =
        draggableMenuLoaderStore.getState().setDraggableMenuLoading;
      try {
        setDraggableMenuLoading(true);
        set({ isLoadingMeteopostArchive: true });
        const { data } = await fetchMeteopostArchiveData({ sid_id });
        if (data) {
          const temperatureMin = data
            .filter(hasTMin)
            .map((el) => ({
              x: el.dt * 1000,
              y: Math.round(el.t_min * 1000) / 1000,
            }))
            .sort((a, b) => a.x - b.x);

          const temperatureMax = data
            .filter(hasTMax)
            .map((el) => ({
              x: el.dt * 1000,
              y: Math.round(el.t_max * 1000) / 1000,
            }))
            .sort((a, b) => a.x - b.x);

          const precipitation = data
            .filter(hasPrecipMean)
            .map((el) => ({
              x: el.dt * 1000,
              y: Math.round(el.precip_mean * 1000) / 1000,
            }))
            .sort((a, b) => a.x - b.x);

          set({
            data: {
              TEMPERATURE_MIN: temperatureMin,
              TEMPERATURE_MAX: temperatureMax,
              PRECIPITATION: precipitation,
            },
            errorMessage:
              data.length === 0 ||
              (temperatureMin.length === 0 &&
                temperatureMax.length === 0 &&
                precipitation.length === 0)
                ? `Отсутствуют данные для архивного метеопоста ${sid_id}`
                : '',
          });
        } else {
          set({
            data: {
              TEMPERATURE_MIN: [],
              TEMPERATURE_MAX: [],
              PRECIPITATION: [],
            },
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
      }),
  ],
);
