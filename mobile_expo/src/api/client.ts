import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// CONFIGURACIÓN DE URL DEL BACKEND
// ============================================

// DESARROLLO LOCAL (para probar en emulador/simulador)
// export const API_BASE_URL = 'http://192.168.68.105:3001';  // Android emulador
// export const API_BASE_URL = 'http://localhost:3001';       // iOS Simulator

// PRODUCCIÓN - Railway (reemplaza con tu URL real después del deploy)
// ANTES (Railway):
// export const API_BASE_URL = 'https://adlanzarote-backend-production.up.railway.app';

// DESPUÉS (tu VPS):
export const API_BASE_URL = 'https://adlanzarote.es';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega JWT automáticamente
client.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@adlanzarote_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Interceptor: maneja errores globales
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('@adlanzarote_token');
      AsyncStorage.removeItem('@adlanzarote_user');
    }
    return Promise.reject(error);
  }
);

export default client;
