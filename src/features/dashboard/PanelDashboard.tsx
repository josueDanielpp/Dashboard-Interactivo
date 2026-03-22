import type { DefinicionPanel } from './tipos';
import { MapaActividadEconomica } from './MapaActividadEconomica';

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
    return (
      <div className="vista-tabla">
        {[
          ['Aguascalientes', 'Comercio al por menor', 'Mediana'],
          ['Jesus Maria', 'Servicios de preparacion de alimentos', 'Micro'],
          ['Aguascalientes', 'Fabricacion de autopartes', 'Grande'],
          ['San Francisco de los Romo', 'Logistica y almacenamiento', 'Pequena'],
          ['Calvillo', 'Alojamiento temporal y turismo', 'Micro'],
        ].map(([municipio, sector, tamano]) => (
          <div key={`${municipio}-${sector}`} className="vista-tabla__fila">
            <span>{municipio}</span>
            <strong>{sector}</strong>
            <span>{tamano}</span>
          </div>
        ))}
      </div>
    );
  }

  if (panel.variante === 'barras') {
    const barras = [
      { etiqueta: 'Servicios', valor: 842, clase: 'barra barra--amarilla' },
      { etiqueta: 'Industria', valor: 516, clase: 'barra barra--naranja' },
      { etiqueta: 'Comercio', valor: 934, clase: 'barra barra--verde' },
    ];

    return (
      <div className="vista-barras">
        {barras.map((barra) => (
          <div key={barra.etiqueta} className="vista-barras__columna">
            <span className="vista-barras__valor">{barra.valor}</span>
            <div className={barra.clase} />
            <span className="vista-barras__etiqueta">{barra.etiqueta}</span>
          </div>
        ))}
      </div>
    );
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
