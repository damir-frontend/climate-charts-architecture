import { draggableMenuLoaderStore } from '@app/entities/draggable-menu/loader/model';
import { fetchHydropostArchiveData } from '@app/shared/api/charts/fetch-hydropost-archive-data';
import { create, TStore } from '@utils';
import { THydropostArchiveChartState } from './types';
import { hasQ, hasV } from './utils';

const initialChartState = {
  isLoading: false,
  data: {
    FLOW: [],
    LEVEL: [],
  },
  labels: [],
  offsetCalc: 0,
  errorMessage: '',
  warningMessage: '',
  visible: false,
};

export const hydropostArchiveChartStore: TStore<THydropostArchiveChartState> = create(
  (set, get) => ({
    ...initialChartState,
    resetGraph: () => set({ ...initialChartState }),
    setVisible: (value) => set({ visible: value }),
    setLabels: (labels) => set({ labels }),
    setOffsetCalc: (offsetCalc) => set({ offsetCalc }),
    setWarningMessage: (message) => set({ warningMessage: message }),
    setIsLoading(isLoading) {
      set({ isLoading });
    },
    loadHydropostArchiveData: async ({ sid_id }) => {
      if (sid_id) {
        const setDraggableMenuLoading =
          draggableMenuLoaderStore.getState().setDraggableMenuLoading;
        try {
          setDraggableMenuLoading(true);
          const { data } = await fetchHydropostArchiveData({ sid_id });

          if (data) {
            const waterFlowData = data
              .filter(hasQ)
              .map((el) => ({
                x: el.dt * 1000,
                y: Math.round(el.q * 1000) / 1000,
              }))
              .sort((a, b) => a.x - b.x);

            const waterLevelData = data
              .filter(hasV)
              .map((el) => ({
                x: el.dt * 1000,
                y: Math.round(el.v * 1000) / 1000,
              }))
              .sort((a, b) => a.x - b.x);

            set({
              data: {
                FLOW: waterFlowData,
                LEVEL: waterLevelData,
              },
            });
          } else {
            set({
              data: {
                FLOW: [],
                LEVEL: [],
              },
            });
            get().setWarningMessage('Данных нет');
          }
        } catch (err) {
          console.log(err);
        } finally {
          setDraggableMenuLoading(false);
        }
      }
    },
    setErrorMessage: (message) => set({ errorMessage: message }),
  }),
  [
    (state) => state.labels,
    (labels) =>
      hydropostArchiveChartStore.setState({
        visible: labels.length > 0,
      }),
  ],
);
