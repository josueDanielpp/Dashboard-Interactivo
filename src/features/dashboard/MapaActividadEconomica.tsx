import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Draw from 'ol/interaction/Draw';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';

type PanelMapa = 'capas' | 'dibujar' | 'simbologia' | 'fondo';
type FondoMapa = 'osm' | 'claro' | 'oscuro';

const centroAguascalientes = fromLonLat([-102.296, 21.885]);

function crearPoligono(coords: Array<[number, number]>) {
  return new Feature({
    geometry: new Polygon([coords.map(([lon, lat]) => fromLonLat([lon, lat]))]),
  });
}

function crearPunto(lon: number, lat: number) {
  return new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
  });
}

const estiloMunicipios = new Style({
  stroke: new Stroke({
    color: '#0f766e',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(15, 118, 110, 0.12)',
  }),
});

const estiloAgeb = new Style({
  stroke: new Stroke({
    color: '#175cd3',
    width: 1.5,
    lineDash: [8, 6],
  }),
  fill: new Fill({
    color: 'rgba(23, 92, 211, 0.08)',
  }),
});

const estiloDenue = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: '#f59e0b' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
});

const estiloAreaDibujada = new Style({
  stroke: new Stroke({
    color: '#b42318',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(180, 35, 24, 0.14)',
  }),
});

export function MapaActividadEconomica() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const capaMunicipiosRef = useRef<VectorLayer<VectorSource> | null>(null);
  const capaAgebRef = useRef<VectorLayer<VectorSource> | null>(null);
  const capaDenueRef = useRef<VectorLayer<VectorSource> | null>(null);
  const capaDibujoRef = useRef<VectorLayer<VectorSource> | null>(null);
  const fondoOsmRef = useRef<TileLayer<OSM> | null>(null);
  const fondoClaroRef = useRef<TileLayer<XYZ> | null>(null);
  const fondoOscuroRef = useRef<TileLayer<XYZ> | null>(null);

  const [panelActivo, setPanelActivo] = useState<PanelMapa>('capas');
  const [mostrarMunicipios, setMostrarMunicipios] = useState(true);
  const [mostrarAgeb, setMostrarAgeb] = useState(true);
  const [mostrarDenue, setMostrarDenue] = useState(true);
  const [fondoMapa, setFondoMapa] = useState<FondoMapa>('osm');
  const [modoDibujoActivo, setModoDibujoActivo] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

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

    const municipiosSource = new VectorSource({
      features: [
        crearPoligono([
          [-102.405, 21.99],
          [-102.23, 21.99],
          [-102.17, 21.875],
          [-102.26, 21.78],
          [-102.42, 21.82],
          [-102.405, 21.99],
        ]),
      ],
    });

    const agebSource = new VectorSource({
      features: [
        crearPoligono([
          [-102.34, 21.94],
          [-102.26, 21.94],
          [-102.245, 21.885],
          [-102.33, 21.86],
          [-102.34, 21.94],
        ]),
        crearPoligono([
          [-102.305, 21.87],
          [-102.225, 21.87],
          [-102.205, 21.825],
          [-102.29, 21.805],
          [-102.305, 21.87],
        ]),
      ],
    });

    const denueSource = new VectorSource({
      features: [
        crearPunto(-102.296, 21.885),
        crearPunto(-102.275, 21.908),
        crearPunto(-102.318, 21.861),
        crearPunto(-102.242, 21.842),
        crearPunto(-102.261, 21.924),
      ],
    });

    const dibujoSource = new VectorSource();

    const capaMunicipios = new VectorLayer({
      source: municipiosSource,
      style: estiloMunicipios,
    });

    const capaAgeb = new VectorLayer({
      source: agebSource,
      style: estiloAgeb,
    });

    const capaDenue = new VectorLayer({
      source: denueSource,
      style: estiloDenue,
    });

    const capaDibujo = new VectorLayer({
      source: dibujoSource,
      style: estiloAreaDibujada,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [fondoOsm, fondoClaro, fondoOscuro, capaMunicipios, capaAgeb, capaDenue, capaDibujo],
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
    capaMunicipiosRef.current = capaMunicipios;
    capaAgebRef.current = capaAgeb;
    capaDenueRef.current = capaDenue;
    capaDibujoRef.current = capaDibujo;
    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    capaMunicipiosRef.current?.setVisible(mostrarMunicipios);
  }, [mostrarMunicipios]);

  useEffect(() => {
    capaAgebRef.current?.setVisible(mostrarAgeb);
  }, [mostrarAgeb]);

  useEffect(() => {
    capaDenueRef.current?.setVisible(mostrarDenue);
  }, [mostrarDenue]);

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

  function limpiarDibujo() {
    capaDibujoRef.current?.getSource()?.clear();
  }

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
              <label className="mapa-opcion">
                <input
                  checked={mostrarMunicipios}
                  onChange={() => setMostrarMunicipios((valor) => !valor)}
                  type="checkbox"
                />
                <span>Limites municipales</span>
              </label>
              <label className="mapa-opcion">
                <input checked={mostrarAgeb} onChange={() => setMostrarAgeb((valor) => !valor)} type="checkbox" />
                <span>AGEB urbanas</span>
              </label>
              <label className="mapa-opcion">
                <input checked={mostrarDenue} onChange={() => setMostrarDenue((valor) => !valor)} type="checkbox" />
                <span>Puntos DENUE</span>
              </label>
            </div>
          ) : null}

          {panelActivo === 'dibujar' ? (
            <div className="mapa-bloque">
              <h3>Dibujar area</h3>
              <p>Activa el modo dibujo para delimitar un poligono de analisis sobre el mapa.</p>
              <button
                className={modoDibujoActivo ? 'mapa-accion mapa-accion--activo' : 'mapa-accion'}
                onClick={() => setModoDibujoActivo((valor) => !valor)}
                type="button"
              >
                {modoDibujoActivo ? 'Desactivar dibujo' : 'Activar dibujo'}
              </button>
              <button className="mapa-accion mapa-accion--secundaria" onClick={limpiarDibujo} type="button">
                Limpiar poligonos
              </button>
            </div>
          ) : null}

          {panelActivo === 'simbologia' ? (
            <div className="mapa-bloque">
              <h3>Simbologia</h3>
              <div className="mapa-simbologia">
                <span><i className="indicador indicador--teal" /> Municipios</span>
                <span><i className="indicador indicador--azul" /> AGEB urbanas</span>
                <span><i className="indicador indicador--naranja" /> DENUE</span>
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
      </div>
    </div>
  );
}
