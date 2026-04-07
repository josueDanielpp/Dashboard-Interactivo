import axios from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';
import { LoginPage } from './features/auth/LoginPage';
import { PaginaDashboard } from './pages/PaginaDashboard';
import { iniciarSesionRequest } from './services/authService';

const CLAVE_SESION = 'dashboard-auth';
const CLAVE_TOKEN = import.meta.env.VITE_AUTH_TOKEN_KEY;

function App() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [sesionActiva, setSesionActiva] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setSesionActiva(
      localStorage.getItem(CLAVE_SESION) === 'ok' && Boolean(sessionStorage.getItem(CLAVE_TOKEN)),
    );
  }, []);

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setEnviando(true);

      const response = await iniciarSesionRequest({
        email: correo,
        password: contrasena,
      });

      const token =
        response.token ?? response.accessToken ?? response.access_token ?? response.jwt;

      if (!token) {
        toast.error('El login respondio sin token. Revisa el formato de la API.');
        return;
      }

      sessionStorage.setItem(CLAVE_TOKEN, token);
      localStorage.setItem(CLAVE_SESION, 'ok');
      setSesionActiva(true);
      setContrasena('');
      toast.success('Sesion iniciada correctamente.');
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const mensajeApi =
          typeof requestError.response?.data === 'object' &&
          requestError.response?.data !== null &&
          'message' in requestError.response.data
            ? String(requestError.response.data.message)
            : null;

        toast.error(mensajeApi ?? 'No fue posible iniciar sesion con esas credenciales.');
      } else {
        toast.error('Ocurrio un error inesperado al iniciar sesion.');
      }
    } finally {
      setEnviando(false);
    }
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_TOKEN);
    setSesionActiva(false);
    setContrasena('');
  }

  if (sesionActiva) {
    return <PaginaDashboard onCerrarSesion={cerrarSesion} />;
  }

  return (
    <>
      <ToastContainer
        autoClose={4000}
        closeOnClick
        newestOnTop
        pauseOnHover
        position="top-right"
        theme="colored"
      />
      <LoginPage
        contrasena={contrasena}
        correo={correo}
        enviando={enviando}
        onCambiarContrasena={setContrasena}
        onCambiarCorreo={setCorreo}
        onSubmit={iniciarSesion}
      />
    </>
  );
}

export default App;
