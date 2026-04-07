import type { Method, RawAxiosRequestHeaders } from 'axios';
import { getAccessToken } from '../authSession';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

interface CreateServiceOptions {
  includeAuth?: boolean;
  withCredentials?: boolean;
  retryOnUnauthorized?: boolean;
}

function buildHeaders(
  extraHeaders: RawAxiosRequestHeaders = {},
  includeAuth = true,
): RawAxiosRequestHeaders {
  const token = getAccessToken();

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

function createService<TData = unknown>(
  method: Method,
  path: string,
  data?: TData,
  headers?: RawAxiosRequestHeaders,
  options: CreateServiceOptions = {},
) {
  return {
    method,
    url: `${apiUrl}${path}`,
    data,
    headers: () => buildHeaders(headers, options.includeAuth ?? true),
    withCredentials: options.withCredentials ?? false,
    retryOnUnauthorized: options.retryOnUnauthorized ?? (options.includeAuth ?? true),
  };
}

export const Config = {
  Auth: {
    Login: <TData>(data: TData) =>
      createService('POST', '/v1/auth/login', data, undefined, {
        includeAuth: false,
        withCredentials: true,
        retryOnUnauthorized: false,
      }),
    Refresh: createService('POST', '/v1/auth/refresh', undefined, undefined, {
      includeAuth: false,
      withCredentials: true,
      retryOnUnauthorized: false,
    }),
    Logout: createService('POST', '/v1/auth/logout', undefined, undefined, {
      includeAuth: true,
      withCredentials: true,
      retryOnUnauthorized: false,
    }),
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
    GetMapSld: (id: string | number) =>
      createService('GET', `/v1/maps/${id}/sld`, undefined, {
        Accept: 'application/xml',
      }, { includeAuth: false, retryOnUnauthorized: false }),
  },
  GeoNode: {
    Identify: <TData>(data: TData) => createService('POST', '/v1/geonode/identify', data),
    GetMunicipiosEstablecimientos: <TData>(data: TData) =>
      createService('POST', '/v1/geonode/municipios/establecimientos/filter', data),
    GetScianEstablecimientos: <TData>(data: TData) =>
      createService('POST', '/v1/geonode/scian/establecimientos/filter', data),
    GetKpis: createService('GET', '/v1/geonode/kpis'),
  },
};

export default Config;
