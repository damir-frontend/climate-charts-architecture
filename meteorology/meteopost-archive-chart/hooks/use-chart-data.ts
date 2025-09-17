import { COLOR_1, COLOR_2, COLOR_3 } from 'app/entities/chart-utils/const';
import { getGraph } from 'app/entities/chart-utils/utils';
import { ChartData } from 'chart.js';
import { useMemo } from 'react';
import { LABELS } from '../consts';
import { meteopostArchiveChartStore } from '../model';

export const useChartData = () => {
  const { dataTemperatureMin, dataTemperatureMax, dataPrecipitation, labels } =
    meteopostArchiveChartStore((state) => state);

  return useMemo(() => {
    const cData: ChartData<'line'> = { datasets: [], labels };
    if (dataTemperatureMin.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataTemperatureMin,
          yAxisID: 'temperature',
          label: LABELS.TEMPERATURE_MIN,
          color: COLOR_1,
        }),
      );
    }
    if (dataTemperatureMax.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataTemperatureMax,
          yAxisID: 'temperature',
          label: LABELS.TEMPERATURE_MAX,
          color: COLOR_2,
        }),
      );
    }
    if (dataPrecipitation.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataPrecipitation,
          yAxisID: 'precipitation',
          label: LABELS.PRECIPITATION,
          color: COLOR_3,
        }),
      );
    }

    return cData;
  }, [labels, dataTemperatureMin, dataTemperatureMax, dataPrecipitation]);
};
