import { useEffect } from 'react';
import { workPointGraphStore } from '../../hydropost-menu/hydropost-draw-chart-menu/model';
import { hydropostChartStore } from '../model';

const toDate = workPointGraphStore.getState().toDate;
const setLabels = hydropostChartStore.getState().setLabels;

export const useHydropostLabels = () => {
  const measuredData = hydropostChartStore.getState().data;
  const calculatedData = hydropostChartStore.getState().calculatedData;
  const dataPrecipitation = hydropostChartStore.getState().dataPrecipitation;
  const dataVolume = hydropostChartStore.getState().volumeData;
  const dataWaste = hydropostChartStore.getState().wasteData;

  useEffect(() => {
    const data = [
      ...measuredData,
      ...calculatedData,
      ...dataPrecipitation,
      ...dataVolume,
      ...dataWaste,
    ];
    const labels = new Set<number>();

    for (const elem of data) {
      labels.add(elem.x);
    }
    if (labels.size > 0 && toDate) {
      labels.add(toDate.unix() * 1000 + 1000 * 60 * 60 * 24);
    }

    setLabels(Array.from(labels).sort());
  }, []);
};
