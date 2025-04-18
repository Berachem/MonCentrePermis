import axios, { AxiosRequestConfig, AxiosError } from "axios";

// Création de l'instance Axios avec baseURL et headers globaux
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // Pour les cookies (si nécessaire)
  headers: {
    Accept: "application/ld+json",
    "Content-Type": "application/ld+json", // Par défaut (GET, POST)
  },
});


// Fonction pour rafraîchir le token
const refreshAuthToken = async () => {
  try {
    // Appel pour rafraîchir le token avec le refresh token
    const response = await apiClient.post("/api/token/refresh"); // Ajuste l'URL selon ton API
    const { token, refreshToken } = response.data;
    
    // Sauvegarder le nouveau token et refreshToken dans les cookies
    document.cookie = `BEARER=${token};path=/;Secure;HttpOnly;SameSite=Lax`;
    document.cookie = `REFRESH_TOKEN=${refreshToken};path=/;Secure;HttpOnly;SameSite=Lax`;
    
    return token;
  } catch (error) {
    // Si le refresh échoue, on peut rediriger l'utilisateur vers la page de login
    console.error("Erreur lors du rafraîchissement du token", error);
    throw error;
  }
};

apiClient.interceptors.response.use(
  (response) => response, // Si la réponse est ok, on la retourne
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Vérifie si la config est définie avant de l'utiliser
      if (error.config) {
        try {
          const newToken = await refreshAuthToken();
          
          // Réessayer la requête originale avec le nouveau token
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(error.config);  // Ré-exécuter la requête originale
        } catch (refreshError) {
          // Si le rafraîchissement échoue, rediriger l'utilisateur vers la page de login
          if(error.response?.data === "Logout successful refresh")  window.location.href = '/login'; 
// Redirige vers la page de login
          return Promise.reject(refreshError);
        }
      } else {
        return Promise.reject(error); // Si config n'est pas définie, on rejette l'erreur
      }
    }

    // Si une autre erreur survient, la retourner
    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter automatiquement le token JWT si présent
apiClient.interceptors.request.use(
  (config) => {
    // Ne pas ajouter d'en-tête Authorization si tu utilises des cookies
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

//file upload
export const getProtectedBlob = async (url: string): Promise<Blob> => {
  try {
    const token = localStorage.getItem("jwtToken");

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
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
