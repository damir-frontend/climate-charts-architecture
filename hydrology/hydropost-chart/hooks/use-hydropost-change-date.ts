import dayjs, { Dayjs } from '@dayjs';
import { cutDateToDayHour } from 'app/entities/datetime-scale/datetime-line-element/utils';
import { useCallback } from 'react';
import { THydropostMeasurement } from '../../hydropost-layer/model';
import { workPointGraphStore } from '../../hydropost-menu/hydropost-draw-chart-menu/model';
import { hydropostChartStore } from '../model';

type THydropostChangeDate = {
  measurements: THydropostMeasurement[] | null;
};

const setWarningMessage = hydropostChartStore.getState().setWarningMessage;
const setFromDate = workPointGraphStore.getState().setFromDate;
const setToDate = workPointGraphStore.getState().setToDate;
export const useHydropostChangeDate = ({ measurements }: THydropostChangeDate) => {
  return useCallback(
    (value: [Dayjs, Dayjs]) => {
      if (!value?.[0] || !value?.[1]) return;

      console.log(value[1]);
      const fromDate = cutDateToDayHour(value[0]);
      const toDate = cutDateToDayHour(value[1]);
      if (measurements && measurements.length > 0) {
        const lastMeasure = dayjs(measurements[0].timestamp)
          .set('minute', 0)
          .set('second', 0)
          .set('millisecond', 0);

        if (+fromDate > +lastMeasure) {
          setWarningMessage('Дата последнего измерения не совпадает с выбранным периодом');
        } else {
          setWarningMessage('');
        }
      }
      setFromDate(fromDate);
      setToDate(toDate);
    },
    [measurements],
  );
};
