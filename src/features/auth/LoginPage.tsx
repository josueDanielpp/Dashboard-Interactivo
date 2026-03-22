import type { FormEvent } from 'react';
import fondoAguascalientes from '../../assets/Images/ags.jpg';
import './login.css';

interface LoginPageProps {
  correo: string;
  contrasena: string;
  credencialesDemo: {
    usuario: string;
    contrasena: string;
  };
  error: string;
  onCambiarContrasena: (valor: string) => void;
  onCambiarCorreo: (valor: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginPage({
  correo,
  contrasena,
  credencialesDemo,
  error,
  onCambiarContrasena,
  onCambiarCorreo,
  onSubmit,
}: LoginPageProps) {
  return (
    <main className="pantalla-login">
      <section
        className="login-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.58), rgba(20, 33, 61, 0.58)), url(${fondoAguascalientes})`,
        }}
      >
        <span className="login-hero__eyebrow">Acceso restringido</span>
        <h1>Dashboard de actividad economica de Aguascalientes</h1>
        <p>
          Esta version del portafolio requiere autenticacion previa antes de mostrar el tablero
          interactivo.
        </p>
        <div className="login-hero__demo">
          <strong>Acceso demo</strong>
          <span>Usuario: {credencialesDemo.usuario}</span>
          <span>Contrasena: {credencialesDemo.contrasena}</span>
        </div>
      </section>

      <section className="panel-login">
        <div>
          <span className="panel-login__etiqueta">Login</span>
          <h2>Iniciar sesion</h2>
          <p>Ingresa para acceder al dashboard interactivo.</p>
        </div>

        <form className="formulario-login" onSubmit={onSubmit}>
          <label className="campo-login">
            <span>Correo</span>
            <input
              autoComplete="username"
              onChange={(event) => onCambiarCorreo(event.target.value)}
              placeholder="reclutador@aguascalientes.mx"
              type="email"
              value={correo}
            />
          </label>

          <label className="campo-login">
            <span>Contrasena</span>
            <input
              autoComplete="current-password"
              onChange={(event) => onCambiarContrasena(event.target.value)}
              placeholder="Ingresa la contrasena"
              type="password"
              value={contrasena}
            />
          </label>

          {error ? <p className="formulario-login__error">{error}</p> : null}

          <button className="formulario-login__boton" type="submit">
            Entrar al dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
