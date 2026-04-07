import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, Method, RawAxiosRequestHeaders } from 'axios';
import { notificarExpiracionSesion, refrescarSesion } from '../authSession';

type HeaderFactory = () => RawAxiosRequestHeaders;

export interface ApiService<TData = unknown> {
  method: Method;
  url: string;
  data?: TData;
  headers?: RawAxiosRequestHeaders | HeaderFactory;
  params?: Record<string, unknown>;
  timeout?: number;
  withCredentials?: boolean;
  retryOnUnauthorized?: boolean;
}

interface ApiUtilsOptions<TResponse> {
  callback?: (data: TResponse) => void;
  error?: (error: unknown) => void;
  before?: () => void;
  end?: () => void;
  headers?: (response: AxiosResponse<TResponse>) => void;
}

const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS);

function construirRequestConfig<TData>(service: ApiService<TData>): AxiosRequestConfig<TData> {
  return {
    method: service.method,
    url: service.url,
    data: service.data,
    headers: typeof service.headers === 'function' ? service.headers() : service.headers,
    params: service.params,
    timeout: service.timeout ?? DEFAULT_TIMEOUT,
    withCredentials: service.withCredentials ?? false,
  };
}

export async function apiUtils<TResponse = unknown, TData = unknown>(
  service: ApiService<TData>,
  options: ApiUtilsOptions<TResponse> = {},
): Promise<TResponse> {
  const { before, callback, error, end, headers } = options;

  try {
    before?.();

    const response = await axios<TResponse, AxiosResponse<TResponse>, TData>(
      construirRequestConfig(service),
    );

    callback?.(response.data);
    headers?.(response);

    return response.data;
  } catch (requestError) {
    if (
      axios.isAxiosError(requestError) &&
      requestError.response?.status === 401 &&
      service.retryOnUnauthorized !== false
    ) {
      try {
        await refrescarSesion();

        const response = await axios<TResponse, AxiosResponse<TResponse>, TData>(
          construirRequestConfig(service),
        );

        callback?.(response.data);
        headers?.(response);

        return response.data;
      } catch (refreshError) {
        notificarExpiracionSesion();
        error?.(refreshError);
        throw refreshError;
      }
    }

    error?.(requestError);
    throw requestError;
  } finally {
    end?.();
  }
}

export default apiUtils;
