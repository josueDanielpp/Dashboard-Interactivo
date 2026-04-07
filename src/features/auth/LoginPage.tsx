import type { FormEvent } from 'react';
import fondoAguascalientes from '../../assets/Images/ags.jpg';
import './login.css';

interface LoginPageProps {
  correo: string;
  contrasena: string;
  enviando: boolean;
  onCambiarContrasena: (valor: string) => void;
  onCambiarCorreo: (valor: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginPage({
  correo,
  contrasena,
  enviando,
  onCambiarContrasena,
  onCambiarCorreo,
  onSubmit,
}: LoginPageProps) {
  const mostrarAccesoDemo = import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

  return (
    <main className="pantalla-login">
      <section
        className="login-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.38), rgba(20, 33, 61, 0.42)), url(${fondoAguascalientes})`,
        }}
      >
        <span className="login-hero__eyebrow">Proyecto de análisis territorial</span>
        <h1>Dashboard de actividad económica de Aguascalientes</h1>
        <p>
          Plataforma interactiva para explorar concentración territorial, distribución por municipio
          y comportamiento por giro SCIAN a partir de datos del DENUE.
        </p>
        {mostrarAccesoDemo ? (
          <div className="login-hero__demo">
            <strong>Acceso de evaluación</strong>
            <span>Usuario: reclutador@aguascalientes.mx</span>
            <span>Contraseña: DashboardAgs2026!</span>
          </div>
        ) : null}
      </section>

      <section className="panel-login">
        <div>
          <span className="panel-login__etiqueta">Acceso</span>
          <h2>Iniciar sesión</h2>
          <p>Ingresa para acceder al dashboard interactivo.</p>
        </div>

        <form className="formulario-login" onSubmit={onSubmit}>
          <label className="campo-login">
            <span>Correo</span>
            <input
              autoComplete="username"
              disabled={enviando}
              onChange={(event) => onCambiarCorreo(event.target.value)}
              placeholder="reclutador@aguascalientes.mx"
              type="email"
              value={correo}
            />
          </label>

          <label className="campo-login">
            <span>Contraseña</span>
            <input
              autoComplete="current-password"
              disabled={enviando}
              onChange={(event) => onCambiarContrasena(event.target.value)}
              placeholder="DashboardAgs2026!"
              type="password"
              value={contrasena}
            />
          </label>
          <button className="formulario-login__boton" disabled={enviando} type="submit">
            {enviando ? 'Validando acceso...' : 'Entrar al dashboard'}
          </button>
        </form>
      </section>
    </main>
  );
}
