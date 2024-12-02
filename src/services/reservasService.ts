export interface Reserva {
    id: number;
    usuario_id: number;
    campus_id: number;
    servicio_id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;
  }
  
  export interface ApiReservasResponse {
    status: number;
    data: Reserva[];
  }
  
  // Nueva interface para crear reserva
  export interface CreateReservaRequest {
    run: string;
    register_date: string;
    other_runs: string;
    schedule_id: number;
  }
  
  // Función para crear una nueva reserva
  export const createReserva = async (reservaData: CreateReservaRequest): Promise<any> => {
    try {
      const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/post_reserva', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservaData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating reserva:', error);
      throw error;
    }
  };
  
  // Función existente para obtener reservas
  export const getReservasUsuario = async (): Promise<Reserva[]> => {
    try {
      const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/get_reservas_usuario');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ApiReservasResponse = await response.json();
      if (result.status === 200) {
        return result.data;
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error fetching reservas:', error);
      throw error;
    }
  };