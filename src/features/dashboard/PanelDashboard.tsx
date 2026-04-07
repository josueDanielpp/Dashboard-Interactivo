import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { DefinicionPanel } from './tipos';
import { MapaActividadEconomica } from './MapaActividadEconomica';
import {
  type FiltroGeograficoRequest,
  obtenerGeoNodeKpis,
  obtenerMunicipiosEstablecimientos,
  obtenerScianEstablecimientos,
  type GeoNodeKpis,
  type MunicipioEstablecimientos,
  type ScianEstablecimientos,
} from '../../services/dashboardService';

echarts.use([BarChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

interface PanelDashboardProps {
  filtroGeografico: FiltroGeograficoRequest | null;
  onActualizarFiltroGeografico: (filtro: FiltroGeograficoRequest | null) => void;
  panel: DefinicionPanel;
}

const MAX_ELEMENTOS_VISIBLES = 6;
const FILTRO_GRAFICA_BASE = {} satisfies Omit<FiltroGeograficoRequest, 'wkt'>;

function extraerColeccionRespuesta<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (typeof response === 'object' && response !== null) {
    if (Array.isArray((response as { data?: unknown[] }).data)) {
      return (response as { data: T[] }).data;
    }

    if (Array.isArray((response as { items?: unknown[] }).items)) {
      return (response as { items: T[] }).items;
    }

    if (Array.isArray((response as { results?: unknown[] }).results)) {
      return (response as { results: T[] }).results;
    }

    if (Array.isArray((response as { records?: unknown[] }).records)) {
      return (response as { records: T[] }).records;
    }
  }

  return [];
}

function dividirEtiquetaEnLineas(texto: string, maximoCaracteres = 28, maximoLineas = 3) {
  const palabras = texto.trim().split(/\s+/);

  if (!palabras.length) {
    return texto;
  }

  const lineas: string[] = [];
  let lineaActual = '';
  let indice = 0;

  for (; indice < palabras.length; indice += 1) {
    const palabra = palabras[indice];
    const siguienteLinea = lineaActual ? `${lineaActual} ${palabra}` : palabra;

    if (siguienteLinea.length <= maximoCaracteres) {
      lineaActual = siguienteLinea;
      continue;
    }

    if (lineaActual) {
      lineas.push(lineaActual);
      lineaActual = palabra;
    } else {
      lineas.push(palabra);
      lineaActual = '';
    }

    if (lineas.length === maximoLineas - 1) {
      break;
    }
  }

  const palabrasRestantes = palabras.slice(indice);
  const ultimaLineaBase = [lineaActual, ...palabrasRestantes].filter(Boolean).join(' ');

  if (ultimaLineaBase) {
    const ultimaLinea =
      ultimaLineaBase.length > maximoCaracteres && palabrasRestantes.length > 0
        ? `${lineaActual || palabrasRestantes[0]}...`
        : ultimaLineaBase;
    lineas.push(ultimaLinea);
  }

  return lineas.join('\n');
}

function crearDataZoomVertical(total: number, maximoVisible = MAX_ELEMENTOS_VISIBLES) {
  const totalSeguro = total || 1;
  const visibles = Math.min(maximoVisible, totalSeguro);
  const endPercent = Math.round((visibles / totalSeguro) * 100);

  return [
    {
      type: 'inside' as const,
      yAxisIndex: 0,
      start: 0,
      end: endPercent,
      zoomLock: true,
      moveOnMouseMove: true,
      moveOnMouseWheel: true,
      preventDefaultMouseMove: false,
    },
    {
      type: 'slider' as const,
      yAxisIndex: 0,
      start: 0,
      end: endPercent,
      right: 2,
      width: 16,
      height: '82%',
      brushSelect: false,
      zoomLock: true,
      showDetail: false,
      borderColor: '#b8c6d9',
      backgroundColor: 'rgba(226, 232, 240, 0.85)',
      fillerColor: 'rgba(23, 92, 211, 0.22)',
      dataBackground: {
        lineStyle: {
          color: '#98a2b3',
          opacity: 0.8,
        },
        areaStyle: {
          color: 'rgba(152, 162, 179, 0.28)',
        },
      },
      handleSize: '115%',
      handleIcon:
        'path://M512 128c-35.3 0-64 28.7-64 64v128H320c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h128v128c0 35.3 28.7 64 64 64s64-28.7 64-64V704h128c35.3 0 64-28.7 64-64V384c0-35.3-28.7-64-64-64H576V192c0-35.3-28.7-64-64-64z',
      handleStyle: {
        color: '#175cd3',
        borderColor: '#0b4db3',
        borderWidth: 1,
        shadowBlur: 8,
        shadowColor: 'rgba(23, 92, 211, 0.28)',
      },
      moveHandleSize: 0,
    },
  ];
}

function construirPayloadGrafica(filtroGeografico: FiltroGeograficoRequest | null): FiltroGeograficoRequest {
  if (!filtroGeografico?.wkt) {
    return FILTRO_GRAFICA_BASE;
  }

  return {
    ...FILTRO_GRAFICA_BASE,
    inputSrid: 4326,
    wkt: filtroGeografico.wkt,
  };
}

export function PanelDashboard({ filtroGeografico, onActualizarFiltroGeografico, panel }: PanelDashboardProps) {
  return (
    <article className="panel-dashboard">
      <header className="panel-dashboard__encabezado">
        <div>
          <span className="panel-dashboard__etiqueta">{panel.etiqueta}</span>
          <h2 className="panel-dashboard__titulo">{panel.titulo}</h2>
        </div>
      </header>

      <div className="panel-dashboard__contenido">
        <p className="panel-dashboard__descripcion">{panel.descripcion}</p>
        <VistaPanel
          filtroGeografico={filtroGeografico}
          onActualizarFiltroGeografico={onActualizarFiltroGeografico}
          panel={panel}
        />
      </div>
    </article>
  );
}

function VistaPanel({ filtroGeografico, onActualizarFiltroGeografico, panel }: PanelDashboardProps) {
  if (panel.variante === 'mapa') {
    return <MapaActividadEconomica onActualizarFiltroGeografico={onActualizarFiltroGeografico} />;
  }

  if (panel.variante === 'tabla') {
    return <GraficaEstablecimientos filtroGeografico={filtroGeografico} />;
  }

  if (panel.variante === 'barras') {
    return <GraficaScianEstablecimientos filtroGeografico={filtroGeografico} />;
  }

  if (panel.variante === 'apilado') {
    const filas = [
      { etiqueta: 'Aguascalientes', clientes: 1280, prospectos: 910 },
      { etiqueta: 'Jesus Maria', clientes: 420, prospectos: 265 },
      { etiqueta: 'San Francisco de los Romo', clientes: 310, prospectos: 188 },
    ];

    return (
      <div className="vista-apilada">
        {filas.map((fila) => (
          <div key={fila.etiqueta} className="vista-apilada__fila">
            <span className="vista-apilada__nombre">{fila.etiqueta}</span>
            <div className="vista-apilada__barra">
              <div className="vista-apilada__segmento vista-apilada__segmento--naranja">
                {fila.prospectos}
              </div>
              <div className="vista-apilada__segmento vista-apilada__segmento--verde">
                {fila.clientes}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <PanelKpis />;
}

function PanelKpis() {
  const [datos, setDatos] = useState<GeoNodeKpis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activa = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError(false);
        const response = await obtenerGeoNodeKpis();

        if (!activa) {
          return;
        }

        const payload =
          typeof response === 'object' && response !== null && 'unitsVisible' in response
            ? response
            : response?.data ?? null;
        setDatos(payload);
      } catch {
        if (activa) {
          setError(true);
        }
      } finally {
        if (activa) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activa = false;
    };
  }, []);

  if (cargando) {
    return <div className="vista-metricas">Cargando indicadores...</div>;
  }

  if (error || !datos) {
    return <div className="vista-metricas">No fue posible cargar los indicadores.</div>;
  }

  const formatNumber = new Intl.NumberFormat('es-MX');
  const formatPercent = new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  });

  const tarjetas = [
    {
      nombre: datos.unitsVisible.label,
      valor: formatNumber.format(datos.unitsVisible.value),
      detalle: `Esquema ${datos.schema}`,
      clase: 'tarjeta-metrica--compacta',
      valorClase: 'tarjeta-metrica__valor--numero',
    },
    {
      nombre: datos.municipalitiesWithActivity.label,
      valor: formatNumber.format(datos.municipalitiesWithActivity.value),
      detalle: `${formatNumber.format(datos.municipalitiesWithActivity.total)} municipios (${formatPercent.format(datos.municipalitiesWithActivity.coveragePercentage)}%)`,
      clase: 'tarjeta-metrica--compacta',
      valorClase: 'tarjeta-metrica__valor--numero',
    },
    {
      nombre: datos.dominantSector.label,
      valor: datos.dominantSector.value,
      detalle: `${formatNumber.format(datos.dominantSector.establishments)} establecimientos (${formatPercent.format(datos.dominantSector.sharePercentage)}%)`,
      clase: 'tarjeta-metrica--destacada',
      valorClase: 'tarjeta-metrica__valor--texto',
    },
  ];

  return (
    <div className="vista-metricas">
      {tarjetas.map((tarjeta) => (
        <article key={tarjeta.nombre} className={`tarjeta-metrica ${tarjeta.clase}`}>
          <span>{tarjeta.nombre}</span>
          <strong className={tarjeta.valorClase}>{tarjeta.valor}</strong>
          <small>{tarjeta.detalle}</small>
        </article>
      ))}
    </div>
  );
}

function GraficaEstablecimientos({
  filtroGeografico,
}: Pick<PanelDashboardProps, 'filtroGeografico'>) {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [datos, setDatos] = useState<MunicipioEstablecimientos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activa = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError(false);
        const response = await obtenerMunicipiosEstablecimientos(
          construirPayloadGrafica(filtroGeografico),
        );
        if (!activa) {
          return;
        }
        const payload = extraerColeccionRespuesta<MunicipioEstablecimientos>(response);
        setDatos(payload);
      } catch {
        if (activa) {
          setError(true);
        }
      } finally {
        if (activa) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activa = false;
    };
  }, [filtroGeografico]);

  useEffect(() => {
    const contenedor = contenedorRef.current;

    if (!contenedor) {
      return;
    }

    let chart = chartRef.current;

    if (!chart) {
      chart = echarts.init(contenedor);
      chartRef.current = chart;
    }

    if (!resizeObserverRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        chart?.resize();
      });
      resizeObserver.observe(contenedor);
      resizeObserverRef.current = resizeObserver;
    }

    const datosOrdenados = [...datos].sort(
      (a, b) => b.total_establecimientos - a.total_establecimientos,
    );
    const categorias = datosOrdenados.map((item) => item.nombre);
    const valores = datosOrdenados.map((item) => item.total_establecimientos);
    const formatNumber = new Intl.NumberFormat('es-MX');
    const dataZoom = crearDataZoomVertical(categorias.length);

    chart.clear();
    chart.setOption(
      {
        animationDuration: 500,
        grid: { top: 8, right: 20, bottom: 22, left: 170, containLabel: false },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: Array<{ name: string; value: number }>) => {
            if (!params.length) {
              return '';
            }
            const { name, value } = params[0];
            return `${name}: ${formatNumber.format(value)}`;
          },
        },
        dataZoom,
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#667085',
            formatter: (valor: number) => formatNumber.format(valor),
          },
          splitLine: { lineStyle: { color: '#eef2f6' } },
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: categorias,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            color: '#344054',
            fontWeight: 600,
            width: 150,
            lineHeight: 18,
            overflow: 'break',
            formatter: (valor: string) => dividirEtiquetaEnLineas(valor, 18, 3),
          },
        },
        series: [
          {
            type: 'bar',
            data: valores,
            barWidth: 30,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: '#175cd3' },
                { offset: 1, color: '#7aa2f5' },
              ]),
              borderRadius: [10, 10, 10, 10],
            },
            label: {
              show: true,
              position: 'right',
              color: '#101828',
              fontWeight: 600,
              formatter: (params: { value: number }) => formatNumber.format(params.value),
            },
          },
        ],
      },
      true,
    );
  }, [datos]);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  const mensajeEstado =
    cargando && datos.length === 0
      ? 'Cargando establecimientos...'
      : error && datos.length === 0
        ? 'No fue posible cargar la grafica.'
        : !cargando && datos.length === 0
          ? 'No hay datos disponibles.'
          : null;

  return (
    <div className="vista-tabla vista-tabla--grafica">
      {mensajeEstado ? <div className="vista-grafica__estado">{mensajeEstado}</div> : null}
      <div className="vista-grafica" ref={contenedorRef} />
    </div>
  );
}

function GraficaScianEstablecimientos({
  filtroGeografico,
}: Pick<PanelDashboardProps, 'filtroGeografico'>) {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [datos, setDatos] = useState<ScianEstablecimientos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activa = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError(false);
        const response = await obtenerScianEstablecimientos(
          construirPayloadGrafica(filtroGeografico),
        );
        if (!activa) {
          return;
        }
        const payload = extraerColeccionRespuesta<ScianEstablecimientos>(response);
        setDatos(payload);
      } catch {
        if (activa) {
          setError(true);
        }
      } finally {
        if (activa) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activa = false;
    };
  }, [filtroGeografico]);

  useEffect(() => {
    const contenedor = contenedorRef.current;

    if (!contenedor) {
      return;
    }

    let chart = chartRef.current;

    if (!chart) {
      chart = echarts.init(contenedor);
      chartRef.current = chart;
    }

    if (!resizeObserverRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        chart?.resize();
      });
      resizeObserver.observe(contenedor);
      resizeObserverRef.current = resizeObserver;
    }

    const datosOrdenados = [...datos].sort((a, b) => b.cantidad - a.cantidad);
    const categorias = datosOrdenados.map((item) => item.nombre);
    const valores = datosOrdenados.map((item) => item.cantidad);
    const formatNumber = new Intl.NumberFormat('es-MX');
    const dataZoom = crearDataZoomVertical(categorias.length);

    chart.clear();
    chart.setOption(
      {
        animationDuration: 500,
        grid: { top: 8, right: 20, bottom: 12, left: 100, containLabel: false },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: Array<{ name: string; value: number }>) => {
            if (!params.length) {
              return '';
            }
            const { name, value } = params[0];
            return `${name}: ${formatNumber.format(value)}`;
          },
        },
        dataZoom,
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#667085',
            formatter: (valor: number) => formatNumber.format(valor),
          },
          splitLine: { lineStyle: { color: '#eef2f6' } },
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: categorias,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            color: '#344054',
            fontWeight: 600,
            width: 240,
            lineHeight: 18,
            overflow: 'break',
            formatter: (valor: string) => dividirEtiquetaEnLineas(valor, 28, 3),
          },
        },
        series: [
          {
            type: 'bar',
            data: valores,
            barWidth: 20,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: '#0f766e' },
                { offset: 1, color: '#5fd4c3' },
              ]),
              borderRadius: [10, 10, 10, 10],
            },
            label: {
              show: true,
              position: 'right',
              color: '#101828',
              fontWeight: 600,
              formatter: (params: { value: number }) => formatNumber.format(params.value),
            },
          },
        ],
      },
      true,
    );
  }, [datos]);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  const mensajeEstado =
    cargando && datos.length === 0
      ? 'Cargando giros SCIAN...'
      : error && datos.length === 0
        ? 'No fue posible cargar la grafica.'
        : !cargando && datos.length === 0
          ? 'No hay datos disponibles.'
          : null;

  return (
    <div className="vista-barras vista-barras--grafica">
      {mensajeEstado ? <div className="vista-grafica__estado">{mensajeEstado}</div> : null}
      <div className="vista-grafica" ref={contenedorRef} />
    </div>
  );
}
