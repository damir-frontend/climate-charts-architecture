import { TChartData, TDataCsv } from 'app/entities/chart-utils/const';
import { createCsv, makeLinkCsv } from 'app/entities/chart-utils/utils';
import { workPointStore } from 'app/entities/work-point/model';
import { useCallback } from 'react';
import { LABELS, UNITS } from '../consts';
import { meteopostArchiveChartStore } from '../model';

export const useDownloadCsv = () => {
  const selectedPointId = workPointStore((state) => state.selectedId);
  const { dataTemperatureMin, dataTemperatureMax, dataPrecipitation } =
    meteopostArchiveChartStore((state) => state);

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
    pushData(dataTemperatureMin, `${LABELS.TEMPERATURE_MIN} (${UNITS.TEMPERATURE_MIN})`);
    pushData(dataTemperatureMax, `${LABELS.TEMPERATURE_MAX} (${UNITS.TEMPERATURE_MAX})`);
    pushData(dataPrecipitation, `${LABELS.PRECIPITATION} (${UNITS.PRECIPITATION})`);

    const csv = createCsv(dataDownload);
    if (!csv || dataDownload.length === 0) return;
    makeLinkCsv(csv, `meteopost-archive_${selectedPointId}.csv`);
  }, [dataTemperatureMin, dataTemperatureMax, dataPrecipitation, selectedPointId]);
};
