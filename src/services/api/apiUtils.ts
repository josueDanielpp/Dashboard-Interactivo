import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, Method, RawAxiosRequestHeaders } from 'axios';

export interface ApiService<TData = unknown> {
  method: Method;
  url: string;
  data?: TData;
  headers?: RawAxiosRequestHeaders;
  params?: Record<string, unknown>;
  timeout?: number;
}

interface ApiUtilsOptions<TResponse> {
  callback?: (data: TResponse) => void;
  error?: (error: unknown) => void;
  before?: () => void;
  end?: () => void;
  headers?: (response: AxiosResponse<TResponse>) => void;
}

const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS);

export async function apiUtils<TResponse = unknown, TData = unknown>(
  service: ApiService<TData>,
  options: ApiUtilsOptions<TResponse> = {},
): Promise<TResponse> {
  const { before, callback, error, end, headers } = options;

  try {
    before?.();

    const requestConfig: AxiosRequestConfig<TData> = {
      method: service.method,
      url: service.url,
      data: service.data,
      headers: service.headers,
      params: service.params,
      timeout: service.timeout ?? DEFAULT_TIMEOUT,
    };

    const response = await axios<TResponse, AxiosResponse<TResponse>, TData>(requestConfig);

    callback?.(response.data);
    headers?.(response);

    return response.data;
  } catch (requestError) {
    error?.(requestError);
    throw requestError;
  } finally {
    end?.();
  }
}

export default apiUtils;
