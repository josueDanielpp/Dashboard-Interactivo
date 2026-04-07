/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'production';
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GEOSERVER_BASE_URL: string;
  readonly VITE_API_TIMEOUT_MS: string;
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_MAP_DEFAULT_CENTER_LON: string;
  readonly VITE_MAP_DEFAULT_CENTER_LAT: string;
  readonly VITE_ENABLE_DEMO_LOGIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
