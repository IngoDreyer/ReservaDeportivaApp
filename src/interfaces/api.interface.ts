import { DisponibilidadHorario } from './disponibilidad.interface';

export interface ApiResponse {
  status: number;
  data: DisponibilidadHorario[];
}

export interface ReservaRequest {
  run: number;
  register_date: string;
  schedule_id: number;
}