import apiUtils from './api/apiUtils';
import Config from './api/config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  message?: string;
  [key: string]: unknown;
}

export function iniciarSesionRequest(payload: LoginRequest) {
  return apiUtils<LoginResponse, LoginRequest>(Config.Auth.Login(payload));
}
