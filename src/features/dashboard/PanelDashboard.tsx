import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import type { DefinicionPanel } from './tipos';
import { MapaActividadEconomica } from './MapaActividadEconomica';
import {
  obtenerMunicipiosEstablecimientos,
  obtenerScianEstablecimientos,
  type MunicipioEstablecimientos,
  type ScianEstablecimientos,
} from '../../services/dashboardService';

interface PanelDashboardProps {
  panel: DefinicionPanel;
}

export function PanelDashboard({ panel }: PanelDashboardProps) {
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
        <VistaPanel panel={panel} />
      </div>
    </article>
  );
}

function VistaPanel({ panel }: PanelDashboardProps) {
  if (panel.variante === 'mapa') {
    return <MapaActividadEconomica />;
  }

  if (panel.variante === 'tabla') {
    return <GraficaEstablecimientos />;
  }

  if (panel.variante === 'barras') {
    return <GraficaScianEstablecimientos />;
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

  return (
    <div className="vista-metricas">
      {[
        ['Unidades visibles', '2,190', '+6.4%'],
        ['Municipios con actividad', '11', '100%'],
        ['Sector dominante', 'Comercio', '42%'],
      ].map(([nombre, valor, delta]) => (
        <article key={nombre} className="tarjeta-metrica">
          <span>{nombre}</span>
          <strong>{valor}</strong>
          <small>{delta}</small>
        </article>
      ))}
    </div>
  );
}

function GraficaEstablecimientos() {
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
        const response = await obtenerMunicipiosEstablecimientos();
        if (!activa) {
          return;
        }
        const payload = Array.isArray(response) ? response : response?.data ?? [];
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

    chart.setOption(
      {
        animationDuration: 500,
        grid: { top: 8, right: 16, bottom: 22, left: 130, containLabel: false },
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
          data: categorias,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { color: '#344054', fontWeight: 600 },
        },
        series: [
          {
            type: 'bar',
            data: valores,
            barWidth: 50,
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

  if (cargando) {
    return <div className="vista-tabla vista-tabla--grafica">Cargando establecimientos...</div>;
  }

  if (error) {
    return <div className="vista-tabla vista-tabla--grafica">No fue posible cargar la grafica.</div>;
  }

  if (datos.length === 0) {
    return <div className="vista-tabla vista-tabla--grafica">No hay datos disponibles.</div>;
  }

  return (
    <div className="vista-tabla vista-tabla--grafica">
      <div className="vista-grafica" ref={contenedorRef} />
    </div>
  );
}

function GraficaScianEstablecimientos() {
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
        const response = await obtenerScianEstablecimientos();
        if (!activa) {
          return;
        }
        const payload = Array.isArray(response) ? response : response?.data ?? [];
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
    const total = categorias.length || 1;
    const maxVisible = Math.min(8, total);
    const endPercent = Math.round((maxVisible / total) * 100);

    chart.setOption(
      {
        animationDuration: 500,
        grid: { top: 8, right: 20, bottom: 12, left: 220, containLabel: false },
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
        dataZoom: [
          {
            type: 'inside',
            yAxisIndex: 0,
            start: 0,
            end: endPercent,
          },
          {
            type: 'slider',
            yAxisIndex: 0,
            start: 0,
            end: endPercent,
            right: 4,
            width: 10,
            height: '78%',
            brushSelect: false,
          },
        ],
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
          data: categorias,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            color: '#344054',
            fontWeight: 600,
            width: 200,
            overflow: 'truncate',
            ellipsis: '…',
          },
        },
        series: [
          {
            type: 'bar',
            data: valores,
            barWidth: 18,
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

  if (cargando) {
    return <div className="vista-barras vista-barras--grafica">Cargando giros SCIAN...</div>;
  }

  if (error) {
    return <div className="vista-barras vista-barras--grafica">No fue posible cargar la grafica.</div>;
  }

  if (datos.length === 0) {
    return <div className="vista-barras vista-barras--grafica">No hay datos disponibles.</div>;
  }

  return (
    <div className="vista-barras vista-barras--grafica">
      <div className="vista-grafica" ref={contenedorRef} />
    </div>
  );
}
