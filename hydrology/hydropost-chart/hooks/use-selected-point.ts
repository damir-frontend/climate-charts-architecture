import { workPointStore } from 'app/entities/work-point/model';

export function useSelectedPoint() {
  return workPointStore((state) => {
    const id = state.selectedId;
    return id ? state.mapPoints.get(id) ?? null : null;
  });
}
