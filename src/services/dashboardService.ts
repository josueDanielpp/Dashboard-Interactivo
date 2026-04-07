import apiUtils from './api/apiUtils';
import Config from './api/config';

export interface ResumenDashboard {
  unidadesVisibles: number;
  municipiosActivos: number;
  sectorDominante: string;
}

export interface MapaGeoserver {
  id: number;
  name: string;
  layers: string[];
  layerAliases: string[];
  style: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdentifyRequest {
  layer: string;
  wkt: string;
  schema: string;
  inputSrid: number;
}

export interface MunicipioEstablecimientos {
  nombre: string;
  total_establecimientos: number;
}

export interface MunicipioEstablecimientosResponse {
  schema: string;
  table: string;
  relatedTable: string;
  data: MunicipioEstablecimientos[];
}

export interface ScianEstablecimientos {
  nombre: string;
  cantidad: number;
}

export interface ScianEstablecimientosResponse {
  schema: string;
  table: string;
  relatedTable: string;
  data: ScianEstablecimientos[];
}

export type IdentifyResponse = Record<string, unknown>;
export type MapasGeoserverResponse =
  | MapaGeoserver[]
  | {
      data?: MapaGeoserver[];
      items?: MapaGeoserver[];
      results?: MapaGeoserver[];
    };

export function obtenerResumenDashboard() {
  return apiUtils<ResumenDashboard>(Config.Dashboard.GetResumen);
}

export function obtenerActividadEconomica() {
  return apiUtils(Config.Dashboard.GetActividadEconomica());
}

export function obtenerMapaGeoserver(id: string | number) {
  return apiUtils<MapaGeoserver>(Config.Maps.GetMapById(id));
}

export function obtenerMapasGeoserver() {
  return apiUtils<MapasGeoserverResponse>(Config.Maps.GetMaps);
}

export function obtenerSldMapa(id: string | number) {
  return apiUtils<string>(Config.Maps.GetMapSld(id));
}

export function identificarEnGeoNode(payload: IdentifyRequest) {
  return apiUtils<IdentifyResponse, IdentifyRequest>(Config.GeoNode.Identify(payload));
}

export function obtenerMunicipiosEstablecimientos() {
  return apiUtils<MunicipioEstablecimientosResponse | MunicipioEstablecimientos[]>(
    Config.GeoNode.GetMunicipiosEstablecimientos,
  );
}

export function obtenerScianEstablecimientos() {
  return apiUtils<ScianEstablecimientosResponse | ScianEstablecimientos[]>(
    Config.GeoNode.GetScianEstablecimientos,
  );
}
