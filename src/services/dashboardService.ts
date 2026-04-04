import apiUtils from './api/apiUtils';
import Config from './api/config';

export interface ResumenDashboard {
  unidadesVisibles: number;
  municipiosActivos: number;
  sectorDominante: string;
}

export function obtenerResumenDashboard() {
  return apiUtils<ResumenDashboard>(Config.Dashboard.GetResumen);
}

export function obtenerActividadEconomica() {
  return apiUtils(Config.Dashboard.GetActividadEconomica());
}
