export interface CalendarioProps {
    fechaSeleccionada: Date;
    onCambioFecha: (fecha: Date) => void;
  }
  
  export interface HorariosDisponiblesProps {
    horarios: DisponibilidadHorario[];
    horaSeleccionada: HorarioSeleccionado | null;
    onSeleccionHora: (horario: DisponibilidadHorario) => void;
  }