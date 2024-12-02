export interface HistorialReserva {
    id: number;
    run: number;
    creation: string;
    register_date: string;
    other_runs: string;
    state: boolean;
    day: string;
    start: string;
    finish: string;
    court: string;
    sport: string;
    headquarter: string;
  }
  
  export interface ApiHistorialResponse {
    status: number;
    data: HistorialReserva[];
  }
  
  export const getReservasByRun = async (run: string): Promise<HistorialReserva[]> => {
    try {
      const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/get_reservas_usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ run })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiHistorialResponse = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching reservas:', error);
      throw error;
    }
  };
  
  export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };