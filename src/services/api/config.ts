import type { Method, RawAxiosRequestHeaders } from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY;

function getToken() {
  return sessionStorage.getItem(tokenKey);
}

function buildHeaders(extraHeaders: RawAxiosRequestHeaders = {}): RawAxiosRequestHeaders {
  const token = getToken();

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

function createService<TData = unknown>(
  method: Method,
  path: string,
  data?: TData,
  headers?: RawAxiosRequestHeaders,
) {
  return {
    method,
    url: `${apiUrl}${path}`,
    data,
    headers: buildHeaders(headers),
  };
}

export const Config = {
  Auth: {
    Login: <TData>(data: TData) => createService('POST', '/v1/auth/login', data),
  },
  Cliente: {
    GetClientes: createService('GET', '/cliente/clientes'),
    GetAllClientes: () => createService('GET', '/cliente/clientes/noPaginado'),
    GetClienteById: (id: string | number) => createService('GET', `/cliente/clientes/${id}`),
    CrearCliente: <TData>(data: TData) => createService('POST', '/cliente/clientes', data),
    ActualizarCliente: <TData>(id: string | number, data: TData) =>
      createService('PUT', `/cliente/clientes/${id}`, data),
  },
  Dashboard: {
    GetResumen: createService('GET', '/dashboard/resumen'),
    GetActividadEconomica: () => createService('GET', '/dashboard/actividad-economica'),
  },
  Maps: {
    GetMaps: createService('GET', '/v1/maps'),
    GetMapById: (id: string | number) => createService('GET', `/v1/maps/${id}`),
  },
  GeoNode: {
    Identify: <TData>(data: TData) => createService('POST', '/v1/geonode/identify', data),
    GetMunicipiosEstablecimientos: createService('GET', '/v1/geonode/municipios/establecimientos'),
  },
};

export default Config;
