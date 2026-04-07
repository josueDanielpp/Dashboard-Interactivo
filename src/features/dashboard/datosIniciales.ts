import type { DefinicionPanel, DisposicionPanel } from './tipos';

export const panelesIniciales: DefinicionPanel[] = [
  {
    id: 'mapa',
    titulo: 'Distribucion territorial de unidades economicas',
    descripcion: 'Vista principal para explorar concentracion, densidad y patrones espaciales del DENUE en Aguascalientes.',
    etiqueta: 'Mapa',
    variante: 'mapa',
  },
  {
    id: 'listado',
    titulo: 'Establecimientos por municipio',
    descripcion: 'Comparativa de establecimientos del DENUE por municipio en el estado.',
    etiqueta: 'Municipio',
    variante: 'tabla',
  },
  {
    id: 'embudo',
    titulo: 'Establecimientos por giro SCIAN',
    descripcion: 'Comparativa de giros con mayor numero de establecimientos registrados.',
    etiqueta: 'Giro',
    variante: 'barras',
  },
  
  {
    id: 'metricas',
    titulo: 'Indicadores clave del estado',
    descripcion: 'Resumen ejecutivo con senales rapidas sobre volumen, cobertura y especializacion economica.',
    etiqueta: 'KPIs',
    variante: 'metricas',
  },
];

export const disposicionEscritorio: DisposicionPanel[] = [
  { i: 'mapa', x: 0, y: 0, w: 7, h: 15, minW: 5, minH: 8 },
  { i: 'metricas', x: 7, y: 0, w: 5, h: 7, minW: 4, minH: 5 },
  { i: 'listado', x: 7, y: 7, w: 5, h: 8, minW: 4, minH: 6 },
  { i: 'embudo', x: 0, y: 15, w: 12, h: 10, minW: 6, minH: 6 },
];

export const disposicionTablet: DisposicionPanel[] = [
  { i: 'mapa', x: 0, y: 0, w: 10, h: 13, minW: 6, minH: 8 },
  { i: 'metricas', x: 0, y: 13, w: 10, h: 6, minW: 5, minH: 5 },
  { i: 'listado', x: 0, y: 19, w: 10, h: 8, minW: 5, minH: 6 },
  { i: 'embudo', x: 0, y: 27, w: 10, h: 10, minW: 5, minH: 6 },
];

export const disposicionMovil: DisposicionPanel[] = [
  { i: 'mapa', x: 0, y: 0, w: 6, h: 12, minH: 8 },
  { i: 'metricas', x: 0, y: 12, w: 6, h: 6, minH: 5 },
  { i: 'listado', x: 0, y: 18, w: 6, h: 8, minH: 6 },
  { i: 'embudo', x: 0, y: 26, w: 6, h: 10, minH: 6 },
];

export const disposicionesResponsivas = {
  lg: disposicionEscritorio,
  md: disposicionTablet,
  sm: disposicionMovil,
};
