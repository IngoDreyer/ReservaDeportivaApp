// campusService.ts
import { useState, useEffect } from 'react';
import { getCampus as fetchCampus, getDeportes} from './serviciosDeportivosService';

export interface Deporte {
  id: number;
  name: string;
}

export interface Campus {
  id: number;
  description: string;
}

const API_BASE_URL = 'https://apptuiback.utalca.cl/reservaComplejoDeportivo';

// Función para manejar errores de la API
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Error al conectar con el servidor');
};

// Función helper para obtener el nombre del campus por ID
export const getCampusNameById = (campuses: Campus[], id: number): string => {
  const campus = campuses.find(c => c.id === id);
  return campus ? campus.description : '';
};

// Obtener servicios por ID de campus
export const getServiciosByCampusId = async (campusId: number): Promise<string[]> => {
  try {
    const deportes = await getDeportes(campusId);
    return deportes.map(deporte => deporte.name);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return [];
  }
};

// Hook personalizado para manejar la carga de campus y deportes
export const useCampus = () => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        setLoading(true);
        const data = await fetchCampus();
        setCampuses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los campus');
      } finally {
        setLoading(false);
      }
    };

    loadCampuses();
  }, []);

  const loadDeportes = async (campusId: number) => {
    try {
      const data = await getDeportes(campusId);
      setDeportes(data);
      return data;
    } catch (err) {
      console.error('Error al cargar deportes:', err);
      return [];
    }
  };

  return { campuses, deportes, loading, error, loadDeportes };
};