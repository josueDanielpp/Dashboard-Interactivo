import { useState, type FormEvent } from 'react';
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
  const [contrasenaVisible, setContrasenaVisible] = useState(false);

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

          <div className="campo-login">
            <label htmlFor="contrasena">Contraseña</label>
            <div className="campo-login__password">
              <input
                autoComplete="current-password"
                disabled={enviando}
                id="contrasena"
                onChange={(event) => onCambiarContrasena(event.target.value)}
                placeholder="DashboardAgs2026!"
                type={contrasenaVisible ? 'text' : 'password'}
                value={contrasena}
              />
              <button
                aria-label={contrasenaVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={contrasenaVisible}
                className="campo-login__toggle-password"
                disabled={enviando}
                onClick={() => setContrasenaVisible((visible) => !visible)}
                type="button"
              >
                {contrasenaVisible ? (
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A10.45 10.45 0 0112 4c5.52 0 9 5.5 9 8a6.35 6.35 0 01-1.46 2.96M6.21 6.21C4.22 7.55 3 10.1 3 12c0 2.5 3.48 8 9 8 1.77 0 3.33-.57 4.62-1.43"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                ) : (
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M3 12c0-2.5 3.48-8 9-8s9 5.5 9 8-3.48 8-9 8-9-5.5-9-8z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button className="formulario-login__boton" disabled={enviando} type="submit">
            {enviando ? 'Validando acceso...' : 'Entrar al dashboard'}
          </button>
        </form>
      </section>
    </main>
  );
}
