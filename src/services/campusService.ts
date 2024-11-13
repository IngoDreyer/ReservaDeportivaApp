import { useState, useEffect } from 'react';

// Definición de tipos
export interface Campus {
  id: number;
  description: string;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
}

// Servicios disponibles por campus (temporal hasta tener API)
export const serviciosPorCampus: Record<number, string[]> = {
  1: ['Tenis', 'Fútbol', 'Gimnasio'], // Campus Lircay
  2: ['Gimnasio'],                     // Campus Curicó
  3: ['Gimnasio'],                     // Campus Pehuenche
  4: ['Gimnasio'],                     // Campus Linares
  5: ['Gimnasio'],                     // Campus Santiago
  6: ['Gimnasio']                      // Campus Colchagua
};

// URLs de la API
const API_BASE_URL = 'https://apptuiback.utalca.cl/reservaComplejoDeportivo';

// Función para manejar errores de la API
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Error al conectar con el servidor');
};

// Servicio para obtener los campus
export const getCampus = async (): Promise<Campus[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_campus`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Campus[]> = await response.json();
    
    if (result.status === 200) {
      return result.data;
    } else {
      throw new Error('Error en la respuesta del servidor');
    }
  } catch (error) {
    return handleApiError(error);
  }
};

// Función helper para obtener el nombre del campus por ID
export const getCampusNameById = (campuses: Campus[], id: number): string => {
  const campus = campuses.find(c => c.id === id);
  return campus ? campus.description : '';
};

// Función helper para obtener los servicios por ID de campus
export const getServiciosByCampusId = (campusId: number): string[] => {
  return serviciosPorCampus[campusId] || [];
};

// Hook personalizado para manejar la carga de campus
export const useCampus = () => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        setLoading(true);
        const data = await getCampus();
        setCampuses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los campus');
      } finally {
        setLoading(false);
      }
    };

    loadCampuses();
  }, []);

  return { campuses, loading, error };
};