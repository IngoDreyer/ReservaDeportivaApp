// serviciosDeportivosService.ts
export interface Campus {
    id: number;
    description: string;
}

export interface Servicio {
    id: string;
    campusId: number;
    deporte: string;
    estado: boolean;
    horarios?: string[];
}

export interface ApiResponse {
    status: number;
    data: Campus[];
}

export interface Deporte {
    id: number;
    name: string;
}

export interface ReservaDisponible {
    schedule_id: number;
    day_name: string;
    calendar_date: string;
    start: string;
    finish: string;
    court_id: number;
    court_name: string;
    reservation_id: number | null;
    run: string | null;
    register_date: string | null;
    reservation_state: string | null;
    availability_status: string;
}

export const getCampus = async (): Promise<Campus[]> => {
    try {
        const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/get_campus');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: ApiResponse = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching campus:', error);
        throw error;
    }
};

export const getDeportes = async (campusId: number): Promise<Deporte[]> => {
    try {
        const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/get_campus_complejo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: campusId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.data || 'Error al obtener deportes');
        }

        const result = await response.json();
        
        if (Array.isArray(result)) {
            return result.map(item => ({
                id: item.id,
                name: item.name
            }));
        } else if (result.data && Array.isArray(result.data)) {
            return result.data.map(item => ({
                id: item.id,
                name: item.name
            }));
        } else {
            console.error('Formato de respuesta inesperado:', result);
            return [];
        }
    } catch (error) {
        console.error('Error in getDeportes:', error);
        throw error;
    }
};

export const getReservasDisponibles = async (): Promise<ReservaDisponible[]> => {
    try {
        const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/get_reservas_disponibles');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error('Error fetching reservas disponibles:', error);
        throw error;
    }
};