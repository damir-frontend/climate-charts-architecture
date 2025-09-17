import { draggableMenuLoaderStore } from 'app/entities/draggable-menu/loader/model';
import { selectedWorkPointStore } from 'app/entities/selected-work-point/model';
import { checkMeteopostArchive } from 'app/entities/work-point/operating-point';
import { useCallback, useEffect } from 'react';
import { GraphKey, visibleGraphStore } from '../../visible-graph-store/model';
import { meteopostArchiveChartStore } from '../model';

const setDraggableMenuLoading = draggableMenuLoaderStore.getState().setDraggableMenuLoading;

export const useDrawEffect = () => {
  // ? А надо ли?

  const activeGraph = visibleGraphStore((state) => state.activeGraph);
  const selectedWorkPoint = selectedWorkPointStore((state) => state.selectedWorkPoint);

  const drawChart = useCallback(async () => {
    setDraggableMenuLoading(true);
    try {
      if (checkMeteopostArchive(selectedWorkPoint)) {
        await meteopostArchiveChartStore
          .getState()
          .loadMeteopostArchiveData({ sid_id: selectedWorkPoint.mp_id_arc });
      }
    } catch (err) {
      console.error('Ошибка при загрузке метеопоста архива:', err);
    } finally {
      setTimeout(() => setDraggableMenuLoading(false), 200);
    }
  }, [selectedWorkPoint]);

  useEffect(() => {
    if (activeGraph === GraphKey.MeteopostArchive) {
      drawChart();
    }
  }, [activeGraph, drawChart]);
};
