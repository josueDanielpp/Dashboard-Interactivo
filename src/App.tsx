import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import { LoginPage } from './features/auth/LoginPage';
import { PaginaDashboard } from './pages/PaginaDashboard';

const CLAVE_SESION = 'dashboard-auth';
const USUARIO_DEMO = 'reclutador@aguascalientes.mx';
const PASSWORD_DEMO = 'DashboardAgs2026!';

function App() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [sesionActiva, setSesionActiva] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSesionActiva(localStorage.getItem(CLAVE_SESION) === 'ok');
  }, []);

  function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (correo === USUARIO_DEMO && contrasena === PASSWORD_DEMO) {
      localStorage.setItem(CLAVE_SESION, 'ok');
      setSesionActiva(true);
      setError('');
      return;
    }

    setError('Credenciales incorrectas. Usa el acceso demo configurado.');
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    setSesionActiva(false);
    setContrasena('');
  }

  if (sesionActiva) {
    return <PaginaDashboard onCerrarSesion={cerrarSesion} />;
  }

  return (
    <LoginPage
      contrasena={contrasena}
      correo={correo}
      credencialesDemo={{ usuario: USUARIO_DEMO, contrasena: PASSWORD_DEMO }}
      error={error}
      onCambiarContrasena={setContrasena}
      onCambiarCorreo={setCorreo}
      onSubmit={iniciarSesion}
    />
  );
}

export default App;
