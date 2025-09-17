import dayjs from '@dayjs';
import { useEffect } from 'react';
import { meteopostArchiveChartStore } from '../model';

const setLabelsMeteopostArchive = meteopostArchiveChartStore.getState().setLabels;

// ? вот тут расчет labels
export const useLabelsEffect = () => {
  const dataTemperatureMinMeteopostArchive = meteopostArchiveChartStore(
    (state) => state.dataTemperatureMin,
  );
  const dataTemperatureMaxMeteopostArchive = meteopostArchiveChartStore(
    (state) => state.dataTemperatureMax,
  );
  const dataPrecipitationMeteopostArchive = meteopostArchiveChartStore(
    (state) => state.dataPrecipitation,
  );
  useEffect(() => {
    const data = [
      ...dataTemperatureMinMeteopostArchive.map((el) => el.x),
      ...dataTemperatureMaxMeteopostArchive.map((el) => el.x),
      ...dataPrecipitationMeteopostArchive.map((el) => el.x),
    ];
    const labels = new Set<number>();
    for (const elem of data) {
      labels.add(elem);
    }

    // ? можно ли сортировать прям по текстовому полю без конвертации в дату?
    setLabelsMeteopostArchive(Array.from(labels).sort((a, b) => dayjs(a).diff(dayjs(b))));
  }, [
    dataTemperatureMinMeteopostArchive,
    dataTemperatureMaxMeteopostArchive,
    dataPrecipitationMeteopostArchive,
  ]);
};
