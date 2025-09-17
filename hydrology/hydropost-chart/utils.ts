import { THydropostArchiveData } from '@app/shared/api/charts/fetch-hydropost-archive-data';

export function hasQ(el: THydropostArchiveData): el is THydropostArchiveData & { q: number } {
  return el.q !== null;
}

export function hasV(el: THydropostArchiveData): el is THydropostArchiveData & { v: number } {
  return el.v !== null;
}
