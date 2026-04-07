import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

type AuthFailureHandler = (() => void) | null;

interface AuthTokenResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
}

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let authFailureHandler: AuthFailureHandler = null;

export function extraerAccessToken(response: AuthTokenResponse) {
  return response.accessToken ?? response.access_token ?? response.token ?? response.jwt ?? null;
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function limpiarSesionLocal() {
  accessToken = null;
}

export function registrarManejadorExpiracionSesion(handler: AuthFailureHandler) {
  authFailureHandler = handler;
}

export function notificarExpiracionSesion() {
  limpiarSesionLocal();
  authFailureHandler?.();
}

export async function refrescarSesion() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios
    .post<AuthTokenResponse>(
      `${apiUrl}/v1/auth/refresh`,
      undefined,
      {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    .then((response) => {
      const token = extraerAccessToken(response.data);

      if (!token) {
        throw new Error('El refresh respondio sin access token.');
      }

      setAccessToken(token);
      return token;
    })
    .catch((error: unknown) => {
      limpiarSesionLocal();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function cerrarSesionRemota() {
  const token = getAccessToken();

  try {
    await axios.post(
      `${apiUrl}/v1/auth/logout`,
      undefined,
      {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
  } finally {
    limpiarSesionLocal();
  }
}
