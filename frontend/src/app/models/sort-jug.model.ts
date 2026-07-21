export interface SortJug {
  id?: number;

  numDos: string;
  jugN: string;
  region: string;
  dateSignification: string;
  huissierNotaire: string;
  observation: string;
  remisAuFinancierLe: string;
  mntExec: number | null;
}

export function sortJugVide(): SortJug {
  return {
    numDos: '',
    jugN: '',
    region: '',
    dateSignification: '',
    huissierNotaire: '',
    observation: '',
    remisAuFinancierLe: '',
    mntExec: null
  };
}
