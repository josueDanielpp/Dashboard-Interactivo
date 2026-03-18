import { Responsive, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { disposicionesResponsivas, panelesIniciales } from './datosIniciales';
import { PanelDashboard } from './PanelDashboard';

export function TableroPrincipal() {
  const { containerRef, mounted, width } = useContainerWidth({ initialWidth: 1200 });

  return (
    <main className="pagina-dashboard">
      <header className="barra-superior">
        <div className="marca-dashboard">
          <strong>Geo Business</strong>
          <span>Panel de inteligencia comercial</span>
        </div>

        <nav className="navegacion-dashboard" aria-label="Navegacion principal">
          <a className="navegacion-dashboard__item navegacion-dashboard__item--activo" href="/">
            Indicadores
          </a>
          <a className="navegacion-dashboard__item" href="/">
            Prospeccion
          </a>
          <a className="navegacion-dashboard__item" href="/">
            Ventas
          </a>
        </nav>
      </header>

      <section className="barra-filtros">
        <div className="chip-filtro">Periodo: Ultimos 30 dias</div>
        <div className="chip-filtro">Region: Occidente</div>
        <div className="chip-filtro">Categoria: Refacciones</div>
        <div className="chip-filtro chip-filtro--estado">Actualizacion en linea</div>
      </section>

      <section ref={containerRef} className="seccion-grid">
        {mounted ? (
          <Responsive
            className="layout"
            layouts={disposicionesResponsivas}
            breakpoints={{ lg: 1280, md: 900, sm: 0 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={52}
            margin={[16, 16]}
            width={width}
            dragConfig={{ handle: '.panel-dashboard__encabezado', enabled: true }}
            resizeConfig={{ enabled: true }}
          >
            {panelesIniciales.map((panel) => (
              <div key={panel.id}>
                <PanelDashboard panel={panel} />
              </div>
            ))}
          </Responsive>
        ) : null}
      </section>
    </main>
  );
}
