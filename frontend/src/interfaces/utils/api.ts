// src/utils/api.ts
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// Création d'une instance Axios avec une URL de base
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // process.env.REACT_APP_API_BASE_URL || 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter un intercepteur pour ajouter automatiquement le Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken'); // Récupère le JWT depuis le localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fonction pour gérer les requêtes GET
export const getRequest = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Fonction pour gérer les requêtes POST
export const postRequest = async <T, R>(url: string, data: R, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Fonction pour gérer les requêtes PATCH
export const patchRequest = async <T, R>(url: string, data: R, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Fonction pour gérer les requêtes DELETE
export const deleteRequest = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Fonction pour gérer les erreurs d'API
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error('API Error:', axiosError.response?.data || axiosError.message);
  } else {
    console.error('Unexpected Error:', error);
  }
};
