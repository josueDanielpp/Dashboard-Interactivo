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
    titulo: 'Establecimientos destacados',
    descripcion: 'Muestra de unidades economicas para revisar sector, tamano y municipio dentro del estado.',
    etiqueta: 'Directorio',
    variante: 'tabla',
  },
  {
    id: 'embudo',
    titulo: 'Unidades por sector economico',
    descripcion: 'Comparacion inicial entre los sectores con mayor presencia en el territorio.',
    etiqueta: 'Sectores',
    variante: 'barras',
  },
  {
    id: 'entidades',
    titulo: 'Concentracion por municipio',
    descripcion: 'Resumen comparativo para identificar los municipios con mayor actividad economica.',
    etiqueta: 'Municipios',
    variante: 'apilado',
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
  { i: 'mapa', x: 0, y: 0, w: 7, h: 15, minW: 5, minH: 6 },
  { i: 'listado', x: 7, y: 0, w: 5, h: 15, minW: 4, minH: 6 },
  { i: 'embudo', x: 0, y: 9, w: 4, h: 5, minW: 3, minH: 4 },
  { i: 'entidades', x: 4, y: 9, w: 5, h: 5, minW: 4, minH: 4 },
  { i: 'metricas', x: 9, y: 9, w: 3, h: 5, minW: 3, minH: 4 },
];

export const disposicionesResponsivas = {
  lg: disposicionEscritorio
 
};
