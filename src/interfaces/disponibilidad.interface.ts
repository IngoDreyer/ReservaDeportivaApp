export interface DisponibilidadHorario {
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
  
  export interface HorarioSeleccionado {
    id: number;
    hora: string;
    cancha: string;
  }