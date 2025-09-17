import { TChartData, TDataCsv } from 'app/entities/chart-utils/const';
import { createCsv, makeLinkCsv } from 'app/entities/chart-utils/utils';
import { workPointStore } from 'app/entities/work-point/model';
import { useCallback } from 'react';
import { FORMAT_DATE } from 'utils/consts';
import { workPointGraphStore } from '../../hydropost-menu/hydropost-draw-chart-menu/model';
import { LABELS, UNITS } from '../consts';
import { hydropostChartStore } from '../model';

export const useDownloadCsv = () => {
  const selectedPointId = workPointStore((state) => state.selectedId);
  const { data, calculatedData, dataPrecipitation, volumeData, wasteData } =
    hydropostChartStore.getState();
  const { fromDate, toDate } = workPointGraphStore.getState();

  return useCallback(() => {
    const dataDownload: TDataCsv = [];
    const pushData = (data: TChartData, label: string) => {
      if (data.length > 0) {
        dataDownload.push({
          data: data,
          label: label,
        });
      }
    };
    pushData(data, `${LABELS.DATA} (${UNITS.DATA})`);
    pushData(calculatedData, `${LABELS.CALCULATED_DATA} (${UNITS.CALCULATED_DATA})`);
    pushData(dataPrecipitation, `${LABELS.PRECIPITATION} (${UNITS.PRECIPITATION})`);
    pushData(volumeData, `${LABELS.VOLUME} (${UNITS.VOLUME})`);
    pushData(wasteData, `${LABELS.WASTE} (${UNITS.WASTE})`);

    const csv = createCsv(dataDownload);
    if (!csv || dataDownload.length === 0) return;
    makeLinkCsv(
      csv,
      `hydropost_${selectedPointId}_${fromDate.format(FORMAT_DATE.SHORT)}-${toDate.format(
        FORMAT_DATE.SHORT,
      )}.csv`,
    );
  }, [
    data,
    calculatedData,
    dataPrecipitation,
    volumeData,
    wasteData,
    fromDate,
    toDate,
    selectedPointId,
  ]);
};
