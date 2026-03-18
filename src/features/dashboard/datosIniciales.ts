import type { DefinicionPanel, DisposicionPanel } from './tipos';

export const panelesIniciales: DefinicionPanel[] = [
  {
    id: 'mapa',
    titulo: 'Cobertura territorial',
    descripcion: 'Vista principal para explorar actividad, densidad y distribucion por entidad.',
    etiqueta: 'Mapa',
    variante: 'mapa',
  },
  {
    id: 'listado',
    titulo: 'Prospectos detectados',
    descripcion: 'Tabla operativa con negocios, clasificacion y seguimiento comercial.',
    etiqueta: 'Listado',
    variante: 'tabla',
  },
  {
    id: 'embudo',
    titulo: 'Embudo de prospeccion',
    descripcion: 'Comparacion entre detectados, prospectos y clientes.',
    etiqueta: 'Conversion',
    variante: 'barras',
  },
  {
    id: 'entidades',
    titulo: 'Trabajo de campo por entidad',
    descripcion: 'Resumen apilado para revisar desempeno territorial.',
    etiqueta: 'Entidades',
    variante: 'apilado',
  },
  {
    id: 'metricas',
    titulo: 'Indicadores clave',
    descripcion: 'Bloque de seguimiento para avance comercial y cobertura.',
    etiqueta: 'KPIs',
    variante: 'metricas',
  },
];

export const disposicionEscritorio: DisposicionPanel[] = [
  { i: 'mapa', x: 0, y: 0, w: 7, h: 9, minW: 5, minH: 6 },
  { i: 'listado', x: 7, y: 0, w: 5, h: 9, minW: 4, minH: 6 },
  { i: 'embudo', x: 0, y: 9, w: 4, h: 5, minW: 3, minH: 4 },
  { i: 'entidades', x: 4, y: 9, w: 5, h: 5, minW: 4, minH: 4 },
  { i: 'metricas', x: 9, y: 9, w: 3, h: 5, minW: 3, minH: 4 },
];

export const disposicionesResponsivas = {
  lg: disposicionEscritorio,
  md: [
    { i: 'mapa', x: 0, y: 0, w: 6, h: 8, minH: 6 },
    { i: 'listado', x: 6, y: 0, w: 4, h: 8, minH: 6 },
    { i: 'embudo', x: 0, y: 8, w: 4, h: 5, minH: 4 },
    { i: 'entidades', x: 4, y: 8, w: 6, h: 5, minH: 4 },
    { i: 'metricas', x: 0, y: 13, w: 10, h: 4, minH: 3 },
  ],
  sm: [
    { i: 'metricas', x: 0, y: 0, w: 6, h: 4 },
    { i: 'mapa', x: 0, y: 4, w: 6, h: 7 },
    { i: 'listado', x: 0, y: 11, w: 6, h: 7 },
    { i: 'embudo', x: 0, y: 18, w: 6, h: 5 },
    { i: 'entidades', x: 0, y: 23, w: 6, h: 5 },
  ],
};
