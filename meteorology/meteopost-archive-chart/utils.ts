import { TMeteopostArchiveData } from '@app/shared/api/charts/fetch-meteopost-archive-data';

export function hasTMin(
  el: TMeteopostArchiveData,
): el is TMeteopostArchiveData & { t_min: number } {
  return el.t_min !== null;
}

export function hasTMax(
  el: TMeteopostArchiveData,
): el is TMeteopostArchiveData & { t_max: number } {
  return el.t_max !== null;
}

export function hasPrecipMean(
  el: TMeteopostArchiveData,
): el is TMeteopostArchiveData & { precip_mean: number } {
  return el.precip_mean !== null;
}
