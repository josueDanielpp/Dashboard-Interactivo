import type { DefinicionPanel } from './tipos';

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

        <button className="panel-dashboard__accion" type="button" aria-label={`Expandir ${panel.titulo}`}>
          +
        </button>
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
    return (
      <div className="vista-mapa">
        <div className="vista-mapa__puntos vista-mapa__puntos--norte" />
        <div className="vista-mapa__puntos vista-mapa__puntos--centro" />
        <div className="vista-mapa__puntos vista-mapa__puntos--sur" />
        <div className="vista-mapa__leyenda">
          <span><i className="indicador indicador--verde" /> Clientes</span>
          <span><i className="indicador indicador--amarillo" /> Detectados</span>
          <span><i className="indicador indicador--naranja" /> Prospectos</span>
        </div>
      </div>
    );
  }

  if (panel.variante === 'tabla') {
    return (
      <div className="vista-tabla">
        {[
          ['Detectado', 'Refaccionaria Danielio', 'Cor'],
          ['Detectado', 'Taller Electromecanico Romeros', 'Rep'],
          ['Detectado', 'Taller Mecanico Torres', 'Rep'],
          ['Cliente', 'Refaccionaria Topes Master', 'Cor'],
          ['Prospecto', 'Colosion Gonzalez', 'Cor'],
        ].map(([estado, negocio, categoria]) => (
          <div key={negocio} className="vista-tabla__fila">
            <span>{estado}</span>
            <strong>{negocio}</strong>
            <span>{categoria}</span>
          </div>
        ))}
      </div>
    );
  }

  if (panel.variante === 'barras') {
    const barras = [
      { etiqueta: 'Detectados', valor: 542, clase: 'barra barra--amarilla' },
      { etiqueta: 'Prospectos', valor: 539, clase: 'barra barra--naranja' },
      { etiqueta: 'Clientes', valor: 546, clase: 'barra barra--verde' },
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
      { etiqueta: 'Sinaloa', clientes: 263, prospectos: 283 },
      { etiqueta: 'Jalisco', clientes: 283, prospectos: 256 },
      { etiqueta: 'Sonora', clientes: 241, prospectos: 228 },
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
        ['Cobertura', '82%', '+4.8%'],
        ['Seguimiento', '317', '+12'],
        ['Alertas', '09', '-2'],
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
