export interface DisposicionPanel {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DefinicionPanel {
  id: string;
  titulo: string;
  descripcion: string;
  etiqueta: string;
  variante: 'mapa' | 'tabla' | 'barras' | 'apilado' | 'metricas';
}
