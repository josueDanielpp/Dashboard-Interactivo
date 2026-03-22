import { Responsive, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { disposicionesResponsivas, panelesIniciales } from './datosIniciales';
import { PanelDashboard } from './PanelDashboard';

interface TableroPrincipalProps {
  onCerrarSesion: () => void;
}

export function TableroPrincipal({ onCerrarSesion }: TableroPrincipalProps) {
  const { containerRef, mounted, width } = useContainerWidth({ initialWidth: 1200 });

  return (
    <main className="pagina-dashboard">
      <header className="barra-superior">
        <div className="marca-dashboard">
          <strong>Aguascalientes Económico</strong>
          <span>Dashboard interactivo de actividad económica estatal</span>
        </div>

        <nav className="navegacion-dashboard" aria-label="Navegacion principal">
          <a className="navegacion-dashboard__item navegacion-dashboard__item--activo" href="/">
            Panorama
          </a>
          <a className="navegacion-dashboard__item" href="/">
            Sectores
          </a>
          <a className="navegacion-dashboard__item" href="/">
            Territorio
          </a>
          <button className="navegacion-dashboard__salir" onClick={onCerrarSesion} type="button">
            Cerrar sesion
          </button>
        </nav>
      </header>

      <section className="barra-filtros">
        <div className="chip-filtro">Fuente: DENUE</div>
        <div className="chip-filtro">Cobertura: Estado de Aguascalientes</div>
        <div className="chip-filtro">Corte: Muestra inicial</div>
        <div className="chip-filtro chip-filtro--estado">GeoNode disponible para capas territoriales</div>
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
            resizeConfig={{ enabled: false }}
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
