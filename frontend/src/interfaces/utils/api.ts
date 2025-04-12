import axios, { AxiosRequestConfig, AxiosError } from "axios";

// Création de l'instance Axios avec baseURL et headers globaux
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/ld+json",
    "Content-Type": "application/ld+json", // Par défaut (GET, POST)
  },
});

// Intercepteur pour ajouter automatiquement le token JWT si présent
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion des erreurs
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    }
  } else {
    console.error("Unexpected Error:", error);
  }
};

// GET
export const getRequest = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// POST
export const postRequest = async <T, R>(
  url: string,
  data: R,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// PATCH (⚠️ Attention à Content-Type spécifique à API Platform)
export const patchRequest = async <T, R>(
  url: string,
  data: R,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.patch<T>(url, data, {
      ...config,
      headers: {
        ...(config?.headers || {}),
        "Content-Type": "application/merge-patch+json",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// DELETE
export const deleteRequest = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
