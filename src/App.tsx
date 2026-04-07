import axios from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';
import { LoginPage } from './features/auth/LoginPage';
import { PaginaDashboard } from './pages/PaginaDashboard';
import {
  cerrarSesionRemota,
  extraerAccessToken,
  iniciarSesionRequest,
  refrescarSesion,
} from './services/authService';
import { registrarManejadorExpiracionSesion, setAccessToken } from './services/authSession';

function App() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [sesionActiva, setSesionActiva] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [validandoSesion, setValidandoSesion] = useState(true);

  useEffect(() => {
    let activa = true;

    registrarManejadorExpiracionSesion(() => {
      if (!activa) {
        return;
      }

      setSesionActiva(false);
      setContrasena('');
      toast.info('Tu sesion expiro. Inicia sesion de nuevo.');
    });

    async function restaurarSesion() {
      try {
        await refrescarSesion();

        if (activa) {
          setSesionActiva(true);
        }
      } catch {
        if (activa) {
          setSesionActiva(false);
        }
      } finally {
        if (activa) {
          setValidandoSesion(false);
        }
      }
    }

    void restaurarSesion();

    return () => {
      activa = false;
      registrarManejadorExpiracionSesion(null);
    };
  }, []);

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setEnviando(true);

      const response = await iniciarSesionRequest({
        email: correo,
        password: contrasena,
      });

      const token = extraerAccessToken(response);

      if (!token) {
        toast.error('El login respondio sin token. Revisa el formato de la API.');
        return;
      }

      setAccessToken(token);
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

  async function cerrarSesion() {
    try {
      await cerrarSesionRemota();
    } catch {
      toast.error('No fue posible cerrar sesion en el servidor.');
    } finally {
      setAccessToken(null);
      setSesionActiva(false);
      setContrasena('');
    }
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
      {validandoSesion ? (
        <main className="estado-app">
          <section className="estado-app__panel">
            <span className="estado-app__eyebrow">Aguascalientes Económico</span>
            <h1>Restaurando sesión</h1>
            <p>Verificando credenciales y preparando el dashboard interactivo.</p>
          </section>
        </main>
      ) : sesionActiva ? (
        <PaginaDashboard onCerrarSesion={cerrarSesion} />
      ) : (
        <LoginPage
          contrasena={contrasena}
          correo={correo}
          enviando={enviando}
          onCambiarContrasena={setContrasena}
          onCambiarCorreo={setCorreo}
          onSubmit={iniciarSesion}
        />
      )}
    </>
  );
}

export default App;
