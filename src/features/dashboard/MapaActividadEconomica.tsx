import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Draw from 'ol/interaction/Draw';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import axios from 'axios';
import { fromLonLat, toLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { toast } from 'react-toastify';
import {
  identificarEnGeoNode,
  obtenerMapasGeoserver,
  type MapaGeoserver,
} from '../../services/dashboardService';

type PanelMapa = 'capas' | 'dibujar' | 'identificar' | 'simbologia' | 'fondo';
type FondoMapa = 'osm' | 'claro' | 'oscuro';

interface CapaMapa {
  alias: string;
  nombre: string;
}

interface ResultadoIdentificacion {
  capaAlias: string;
  capaNombre: string;
  records: Array<Array<[string, string]>>;
  indiceActual: number;
}

const CAMPOS_RECORD_IDENTIFICACION_IGNORADOS = new Set(['geom', 'id', 'oid_']);
const MAPA_SLD_ID = 1;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
const sldUrl = `${apiBaseUrl}/v1/maps/${MAPA_SLD_ID}/sld`;

const centroAguascalientes = fromLonLat([-102.296, 21.885]);
const geoserverBaseUrl = import.meta.env.VITE_GEOSERVER_BASE_URL.replace(/\/$/, '');

const estiloAreaDibujada = new Style({
  stroke: new Stroke({
    color: '#b42318',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(180, 35, 24, 0.14)',
  }),
});

function getWmsUrl() {
  return `${geoserverBaseUrl}/wms`;
}

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function formatearValorIdentificacion(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') {
    return 'Sin dato';
  }

  if (typeof valor === 'string') {
    return valor;
  }

  if (typeof valor === 'number' || typeof valor === 'boolean') {
    return String(valor);
  }

  return JSON.stringify(valor);
}

function normalizarClaveIdentificacion(clave: string): string {
  return clave.trim().toLowerCase();
}

function obtenerToleranciaPixel(zoom: number): number {
  if (zoom >= 17) {
    return 5;
  }

  if (zoom >= 15) {
    return 7;
  }

  if (zoom >= 13) {
    return 10;
  }

  if (zoom >= 11) {
    return 14;
  }

  return 18;
}

function construirWktCuadradoDesdeClick(map: Map, pixel: number[]): string {
  const zoom = map.getView().getZoom() ?? 11;
  const toleranciaPixel = obtenerToleranciaPixel(zoom);

  const esquinaSuperiorIzquierda = map.getCoordinateFromPixel([
    pixel[0] - toleranciaPixel,
    pixel[1] - toleranciaPixel,
  ]);
  const esquinaSuperiorDerecha = map.getCoordinateFromPixel([
    pixel[0] + toleranciaPixel,
    pixel[1] - toleranciaPixel,
  ]);
  const esquinaInferiorDerecha = map.getCoordinateFromPixel([
    pixel[0] + toleranciaPixel,
    pixel[1] + toleranciaPixel,
  ]);
  const esquinaInferiorIzquierda = map.getCoordinateFromPixel([
    pixel[0] - toleranciaPixel,
    pixel[1] + toleranciaPixel,
  ]);

  const vertices = [
    esquinaSuperiorIzquierda,
    esquinaSuperiorDerecha,
    esquinaInferiorDerecha,
    esquinaInferiorIzquierda,
    esquinaSuperiorIzquierda,
  ].map((coordenada) => {
    const [lon, lat] = toLonLat(coordenada);
    return `${lon} ${lat}`;
  });

  return `POLYGON((${vertices.join(', ')}))`;
}

function construirRecordsIdentificacion(response: Record<string, unknown>): Array<Array<[string, string]>> {
  const records = Array.isArray(response.records) ? response.records.filter(esObjetoPlano) : [];

  return records.map((record) =>
    Object.entries(record)
      .filter(([clave]) => !CAMPOS_RECORD_IDENTIFICACION_IGNORADOS.has(normalizarClaveIdentificacion(clave)))
      .filter(([, valor]) => valor !== null && valor !== undefined && valor !== '')
      .map(([clave, valor]) => [clave, formatearValorIdentificacion(valor)]),
  );
}

function normalizarMapasGeoserver(response: unknown): MapaGeoserver[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (esObjetoPlano(response)) {
    if (Array.isArray(response.data)) {
      return response.data as MapaGeoserver[];
    }

    if (Array.isArray(response.items)) {
      return response.items as MapaGeoserver[];
    }

    if (Array.isArray(response.results)) {
      return response.results as MapaGeoserver[];
    }
  }

  return [];
}

function construirCapasDesdeMapas(mapas: MapaGeoserver[]): CapaMapa[] {
  const capasUnicas: Record<string, CapaMapa> = {};

  mapas.forEach((mapa) => {
    mapa.layers.forEach((nombre, index) => {
      if (!capasUnicas[nombre]) {
        capasUnicas[nombre] = {
          nombre,
          alias: mapa.layerAliases[index] ?? nombre,
        };
      }
    });
  });

  return Object.values(capasUnicas);
}

function obtenerCapasWmsVisibles(capasMapa: CapaMapa[], capasVisibles: Record<string, boolean>): string[] {
  return capasMapa
    .filter((capa) => capasVisibles[capa.nombre] ?? true)
    .map((capa) => capa.nombre);
}

export function MapaActividadEconomica() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const capaDibujoRef = useRef<VectorLayer<VectorSource> | null>(null);
  const capaWmsRef = useRef<TileLayer<TileWMS> | null>(null);
  const fondoOsmRef = useRef<TileLayer<OSM> | null>(null);
  const fondoClaroRef = useRef<TileLayer<XYZ> | null>(null);
  const fondoOscuroRef = useRef<TileLayer<XYZ> | null>(null);

  const [panelActivo, setPanelActivo] = useState<PanelMapa>('capas');
  const [fondoMapa, setFondoMapa] = useState<FondoMapa>('osm');
  const [modoDibujoActivo, setModoDibujoActivo] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [capasMapa, setCapasMapa] = useState<CapaMapa[]>([]);
  const [capasVisibles, setCapasVisibles] = useState<Record<string, boolean>>({});
  const [cargandoCapas, setCargandoCapas] = useState(true);
  const [modoIdentificarActivo, setModoIdentificarActivo] = useState(false);
  const [capaIdentificar, setCapaIdentificar] = useState('');
  const [resultadoIdentificacion, setResultadoIdentificacion] = useState<ResultadoIdentificacion | null>(null);
  const [consultandoIdentificacion, setConsultandoIdentificacion] = useState(false);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    const fondoOsm = new TileLayer({
      source: new OSM(),
      visible: true,
    });

    const fondoClaro = new TileLayer({
      source: new XYZ({
        url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attributions: 'CARTO',
      }),
      visible: false,
    });

    const fondoOscuro = new TileLayer({
      source: new XYZ({
        url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        attributions: 'CARTO',
      }),
      visible: false,
    });

    const capaDibujo = new VectorLayer({
      source: new VectorSource(),
      style: estiloAreaDibujada,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [fondoOsm, fondoClaro, fondoOscuro, capaDibujo],
      view: new View({
        center: centroAguascalientes,
        zoom: 11.2,
      }),
      controls: [],
    });

    const resizeObserver = new ResizeObserver(() => {
      map.updateSize();
    });

    resizeObserver.observe(mapElementRef.current);

    fondoOsmRef.current = fondoOsm;
    fondoClaroRef.current = fondoClaro;
    fondoOscuroRef.current = fondoOscuro;
    capaDibujoRef.current = capaDibujo;
    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.setTarget(undefined);
      mapRef.current = null;
      capaWmsRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function cargarMapa() {
      try {
        setCargandoCapas(true);
        const respuestaMapas = await obtenerMapasGeoserver();
        const mapas = normalizarMapasGeoserver(respuestaMapas);

        if (!active) {
          return;
        }

        const capas = construirCapasDesdeMapas(mapas);

        setCapasMapa(capas);
        setCapasVisibles(
          Object.fromEntries(capas.map((capa) => [capa.nombre, true])),
        );
        setCapaIdentificar(capas[0]?.nombre ?? '');
      } catch {
        if (active) {
          toast.error('No fue posible cargar la configuracion del mapa.');
        }
      } finally {
        if (active) {
          setCargandoCapas(false);
        }
      }
    }

    void cargarMapa();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (capaWmsRef.current) {
      map.removeLayer(capaWmsRef.current);
      capaWmsRef.current = null;
    }

    const capasVisiblesIniciales = obtenerCapasWmsVisibles(capasMapa, capasVisibles);

    if (capasVisiblesIniciales.length === 0) {
      return;
    }

    const params: Record<string, unknown> = {
      LAYERS: capasVisiblesIniciales.join(','),
      TILED: true,
    };

    params.SLD = sldUrl;

    const layer = new TileLayer({
      source: new TileWMS({
        url: getWmsUrl(),
        params,
        serverType: 'geoserver',
        transition: 0,
      }),
      visible: true,
    });

    capaWmsRef.current = layer;
    map.addLayer(layer);

    capaDibujoRef.current?.setZIndex(999);

    return () => {
      if (capaWmsRef.current) {
        map.removeLayer(capaWmsRef.current);
        capaWmsRef.current = null;
      }
    };
  }, [capasMapa]);

  useEffect(() => {
    const layer = capaWmsRef.current;

    if (!layer) {
      return;
    }

    const capasVisiblesActuales = obtenerCapasWmsVisibles(capasMapa, capasVisibles);

    layer.setVisible(capasVisiblesActuales.length > 0);

    if (capasVisiblesActuales.length === 0) {
      return;
    }

    const params: Record<string, unknown> = {
      LAYERS: capasVisiblesActuales.join(','),
      TILED: true,
    };

    params.SLD = sldUrl;

    layer.getSource()?.updateParams(params);
  }, [capasMapa, capasVisibles]);

  useEffect(() => {
    if (!fondoOsmRef.current || !fondoClaroRef.current || !fondoOscuroRef.current) {
      return;
    }

    fondoOsmRef.current.setVisible(fondoMapa === 'osm');
    fondoClaroRef.current.setVisible(fondoMapa === 'claro');
    fondoOscuroRef.current.setVisible(fondoMapa === 'oscuro');
  }, [fondoMapa]);

  useEffect(() => {
    const map = mapRef.current;
    const capaDibujo = capaDibujoRef.current;

    if (!map || !capaDibujo) {
      return;
    }

    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (!modoDibujoActivo) {
      return;
    }

    const draw = new Draw({
      source: capaDibujo.getSource()!,
      type: 'Polygon',
    });

    draw.on('drawstart', () => {
      capaDibujo.getSource()?.clear();
    });

    map.addInteraction(draw);
    drawRef.current = draw;

    return () => {
      map.removeInteraction(draw);
      drawRef.current = null;
    };
  }, [modoDibujoActivo]);

  useEffect(() => {
    const map = mapRef.current;
    const eventName = 'singleclick';

    if (!map) {
      return;
    }

    const mapInstance = map;

    async function handleMapClick(event: { coordinate: number[]; pixel: number[] }) {
      if (!modoIdentificarActivo) {
        return;
      }

      if (!capaIdentificar) {
        toast.error('Selecciona una capa para identificar.');
        return;
      }

      const capaSeleccionada = capasMapa.find((capa) => capa.nombre === capaIdentificar);

      if (!capaSeleccionada) {
        toast.error('La capa seleccionada ya no esta disponible.');
        return;
      }

      try {
        setConsultandoIdentificacion(true);

        const wkt = construirWktCuadradoDesdeClick(mapInstance, event.pixel);
        const response = await identificarEnGeoNode({
          layer: capaSeleccionada.nombre,
          wkt,
          schema: 'public',
          inputSrid: 4326,
        });
        const records = construirRecordsIdentificacion(response ?? {});

        if (records.length === 0) {
          setResultadoIdentificacion(null);
          return;
        }

        setResultadoIdentificacion({
          capaAlias: capaSeleccionada.alias,
          capaNombre: capaSeleccionada.nombre,
          records,
          indiceActual: 0,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          toast.error('La capa no fue encontrada.');
        } else {
          toast.error('No fue posible identificar elementos en la capa seleccionada.');
        }
      } finally {
        setConsultandoIdentificacion(false);
      }
    }

    mapInstance.on(eventName as 'singleclick', handleMapClick as (event: unknown) => void);

    return () => {
      mapInstance.un(eventName as 'singleclick', handleMapClick as (event: unknown) => void);
    };
  }, [capasMapa, capaIdentificar, modoIdentificarActivo]);

  function limpiarDibujo() {
    capaDibujoRef.current?.getSource()?.clear();
  }

  function alternarCapa(nombreCapa: string) {
    setCapasVisibles((actual) => ({
      ...actual,
      [nombreCapa]: !actual[nombreCapa],
    }));
  }

  function alternarModoIdentificar() {
    setModoIdentificarActivo((actual) => !actual);
    setModoDibujoActivo(false);
  }

  function cambiarRecordIdentificacion(direccion: -1 | 1) {
    setResultadoIdentificacion((actual) => {
      if (!actual) {
        return actual;
      }

      const siguienteIndice = actual.indiceActual + direccion;

      if (siguienteIndice < 0 || siguienteIndice >= actual.records.length) {
        return actual;
      }

      return {
        ...actual,
        indiceActual: siguienteIndice,
      };
    });
  }

  const recordActual = resultadoIdentificacion
    ? resultadoIdentificacion.records[resultadoIdentificacion.indiceActual] ?? []
    : [];

  return (
    <div className="vista-mapa vista-mapa--real">
      <div className="mapa-visor">
        <div className="mapa-visor__superior">
          <div className="mapa-visor__controles">
            <button
              aria-expanded={menuAbierto}
              aria-label="Abrir menu del mapa"
              className="mapa-hamburguesa"
              onClick={() => setMenuAbierto((valor) => !valor)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
            <span>Centro: Aguascalientes capital</span>
            <span>Zoom inicial: exploracion estatal</span>
          </div>
        </div>
        <div className="mapa-visor__lienzo" ref={mapElementRef} />

        <aside className={menuAbierto ? 'mapa-panel-lateral mapa-panel-lateral--abierto' : 'mapa-panel-lateral'}>
          <button
            className={panelActivo === 'capas' ? 'mapa-tab mapa-tab--activo' : 'mapa-tab'}
            onClick={() => setPanelActivo('capas')}
            type="button"
          >
            Mostrar capas
          </button>
          <button
            className={panelActivo === 'dibujar' ? 'mapa-tab mapa-tab--activo' : 'mapa-tab'}
            onClick={() => setPanelActivo('dibujar')}
            type="button"
          >
            Dibujar area
          </button>
          <button
            className={panelActivo === 'identificar' ? 'mapa-tab mapa-tab--activo' : 'mapa-tab'}
            onClick={() => setPanelActivo('identificar')}
            type="button"
          >
            Identificar
          </button>
          <button
            className={panelActivo === 'simbologia' ? 'mapa-tab mapa-tab--activo' : 'mapa-tab'}
            onClick={() => setPanelActivo('simbologia')}
            type="button"
          >
            Simbologia
          </button>
          <button
            className={panelActivo === 'fondo' ? 'mapa-tab mapa-tab--activo' : 'mapa-tab'}
            onClick={() => setPanelActivo('fondo')}
            type="button"
          >
            Mapa de fondo
          </button>

          <div className="mapa-panel-lateral__contenido">
            {panelActivo === 'capas' ? (
              <div className="mapa-bloque">
                <h3>Capas visibles</h3>
                {cargandoCapas ? <p>Cargando capas WMS...</p> : null}
                {!cargandoCapas
                  ? capasMapa.map((capa) => (
                      <label key={capa.nombre} className="mapa-opcion">
                        <input
                          checked={capasVisibles[capa.nombre] ?? false}
                          onChange={() => alternarCapa(capa.nombre)}
                          type="checkbox"
                        />
                        <span>{capa.alias}</span>
                      </label>
                    ))
                  : null}
              </div>
            ) : null}

            {panelActivo === 'dibujar' ? (
              <div className="mapa-bloque">
                <h3>Dibujar area</h3>
                <p>Activa el modo dibujo para delimitar un poligono de analisis sobre el mapa.</p>
                <button
                  className={modoDibujoActivo ? 'mapa-accion mapa-accion--activo' : 'mapa-accion'}
                  onClick={() => {
                    setModoIdentificarActivo(false);
                    setModoDibujoActivo((valor) => !valor);
                  }}
                  type="button"
                >
                  {modoDibujoActivo ? 'Desactivar dibujo' : 'Activar dibujo'}
                </button>
                <button className="mapa-accion mapa-accion--secundaria" onClick={limpiarDibujo} type="button">
                  Limpiar poligonos
                </button>
              </div>
            ) : null}

            {panelActivo === 'identificar' ? (
              <div className="mapa-bloque">
                <h3>Identificar</h3>
                <p>Selecciona una capa, activa la herramienta y haz clic sobre el mapa.</p>
                <label className="mapa-select">
                  <span>Capa a consultar</span>
                  <select
                    onChange={(event) => setCapaIdentificar(event.target.value)}
                    value={capaIdentificar}
                  >
                    {capasMapa.map((capa) => (
                      <option key={capa.nombre} value={capa.nombre}>
                        {capa.alias}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={modoIdentificarActivo ? 'mapa-accion mapa-accion--activo' : 'mapa-accion'}
                  disabled={consultandoIdentificacion || !capaIdentificar}
                  onClick={alternarModoIdentificar}
                  type="button"
                >
                  {modoIdentificarActivo ? 'Desactivar identificar' : 'Activar identificar'}
                </button>
              </div>
            ) : null}

            {panelActivo === 'simbologia' ? (
              <div className="mapa-bloque">
                <h3>Simbologia</h3>
                <div className="mapa-simbologia">
                  {capasMapa.map((capa) => (
                    <span key={capa.nombre}>{capa.alias}</span>
                  ))}
                  <span><i className="indicador indicador--rojo" /> Area dibujada</span>
                </div>
              </div>
            ) : null}

            {panelActivo === 'fondo' ? (
              <div className="mapa-bloque">
                <h3>Mapa de fondo</h3>
                <label className="mapa-opcion">
                  <input checked={fondoMapa === 'osm'} onChange={() => setFondoMapa('osm')} type="radio" />
                  <span>OpenStreetMap</span>
                </label>
                <label className="mapa-opcion">
                  <input checked={fondoMapa === 'claro'} onChange={() => setFondoMapa('claro')} type="radio" />
                  <span>Claro</span>
                </label>
                <label className="mapa-opcion">
                  <input checked={fondoMapa === 'oscuro'} onChange={() => setFondoMapa('oscuro')} type="radio" />
                  <span>Oscuro</span>
                </label>
              </div>
            ) : null}
          </div>
        </aside>

        {resultadoIdentificacion ? (
          <section className="mapa-identificar-panel">
            <div className="mapa-identificar-panel__encabezado">
              <div>
                <strong>Identificacion</strong>
                <span>{resultadoIdentificacion.capaAlias}</span>
              </div>
              <button
                aria-label="Cerrar identificacion"
                className="mapa-identificar-panel__cerrar"
                onClick={() => setResultadoIdentificacion(null)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="mapa-identificar-panel__paginacion">
              <button
                aria-label="Record anterior"
                className="mapa-identificar-panel__nav"
                disabled={resultadoIdentificacion.indiceActual === 0}
                onClick={() => cambiarRecordIdentificacion(-1)}
                type="button"
              >
                ‹
              </button>
              <span>
                Record {Math.min(resultadoIdentificacion.indiceActual + 1, Math.max(resultadoIdentificacion.records.length, 1))}
                {' '}de {Math.max(resultadoIdentificacion.records.length, 1)}
              </span>
              <button
                aria-label="Record siguiente"
                className="mapa-identificar-panel__nav"
                disabled={resultadoIdentificacion.indiceActual >= resultadoIdentificacion.records.length - 1}
                onClick={() => cambiarRecordIdentificacion(1)}
                type="button"
              >
                ›
              </button>
            </div>
            <div className="mapa-identificar-panel__contenido">
              {recordActual.length > 0
                ? recordActual.map(([clave, valor]) => (
                    <div key={clave} className="mapa-identificar-panel__fila mapa-identificar-panel__fila--atributo">
                      <span>{clave}</span>
                      <strong title={valor}>{valor}</strong>
                    </div>
                  ))
                : <p>No se encontraron records para este punto.</p>}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
