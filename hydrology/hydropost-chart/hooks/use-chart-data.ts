import { COLOR_1, COLOR_2, COLOR_3, COLOR_4, COLOR_5 } from 'app/entities/chart-utils/const';
import { getGraph } from 'app/entities/chart-utils/utils';
import { ChartData } from 'chart.js';
import { useMemo } from 'react';
import { LABELS } from '../consts';
import { hydropostChartStore } from '../model';

export const useChartData = ({ waterLevelDelta }: { waterLevelDelta: number }) => {
  const {
    data,
    calculatedData,
    dataPrecipitation,
    volumeData,
    wasteData,
    labels,
    yAxisScaleMin,
    yAxisScaleMax,
    offsetCalc,
  } = hydropostChartStore.getState();

  return useMemo(() => {
    const cData: ChartData<'line'> = { datasets: [], labels };
    if (calculatedData.length > 0) {
      cData.datasets.push(
        getGraph({
          data: calculatedData
            .map((elem) => ({ ...elem, y: elem.y + offsetCalc }))
            .sort((a, b) => a.x - b.x),
          yAxisID: 'waterLevel',
          label: LABELS.CALCULATED_DATA,
          color: COLOR_2,
        }),
      );
    }
    if (dataPrecipitation.length > 0) {
      cData.datasets.push(
        getGraph({
          data: dataPrecipitation.sort((a, b) => a.x - b.x),
          yAxisID: 'precipitation',
          label: LABELS.PRECIPITATION,
          color: COLOR_3,
        }),
      );
    }
    if (volumeData.length > 0) {
      cData.datasets.push(
        getGraph({
          data: volumeData.sort((a, b) => a.x - b.x),
          yAxisID: 'volume',
          label: LABELS.VOLUME,
          color: COLOR_4,
        }),
      );
    }
    if (wasteData.length > 0) {
      cData.datasets.push(
        getGraph({
          data: wasteData.sort((a, b) => a.x - b.x),
          yAxisID: 'waste',
          label: LABELS.WASTE,
          color: COLOR_5,
        }),
      );
    }
    if (data.length > 0) {
      cData.datasets.push(
        getGraph({
          data: data
            .map((v) => ({ ...v, y: v.y + waterLevelDelta }))
            .filter((e) => e.y >= yAxisScaleMin && e.y <= yAxisScaleMax)
            .sort((a, b) => a.x - b.x),
          yAxisID: 'waterLevel',
          label: LABELS.DATA,
          color: COLOR_1,
          borderColor: 'rgba(0, 162, 232, 0)', // чтобы были отдельные точки
          pointRadius: 2, // толще дефолтного
        }),
      );
    }

    return cData;
  }, [
    labels,
    data,
    calculatedData,
    dataPrecipitation,
    volumeData,
    wasteData,
    yAxisScaleMin,
    yAxisScaleMax,
    offsetCalc,
    waterLevelDelta,
  ]);
};
