import React from 'react';
import { IonList, IonButton } from '@ionic/react';
import './HorariosDisponibles.css';

interface DisponibilidadHorario {
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



interface HorariosDisponiblesProps {
  horarios: DisponibilidadHorario[];
  horaSeleccionada: {
    id: number;
    hora: string;
    cancha: string;
  } | null;
  onSeleccionHora: (horario: DisponibilidadHorario) => void;
}

const HorariosDisponibles: React.FC<HorariosDisponiblesProps> = ({
  horarios,
  horaSeleccionada,
  onSeleccionHora,
}) => {
  // Agrupar horarios por cancha
  const horariosPorCancha = horarios.reduce((acc, horario) => {
    if (!acc[horario.court_name]) {
      acc[horario.court_name] = [];
    }
    acc[horario.court_name].push(horario);
    return acc;
  }, {} as Record<string, DisponibilidadHorario[]>);

  // Ordenar horarios dentro de cada cancha
  Object.values(horariosPorCancha).forEach(horariosCancha => {
    horariosCancha.sort((a, b) => {
      return a.start.localeCompare(b.start);
    });
  });

  const formatearHora = (hora: string) => {
    const [hours, minutes] = hora.split(':');
    return `${hours}:${minutes}`;
  };

  if (horarios.length === 0) {
    return <p>No hay horarios disponibles para esta fecha.</p>;
  }

  return (
    <IonList>
      {Object.entries(horariosPorCancha).map(([cancha, horariosCancha]) => (
        <div key={cancha} className="cancha-container">
          <h4 className="cancha-title">{cancha}</h4>
          <div className="horarios-grid">
            {horariosCancha.map((horario) => (
              <IonButton
                key={horario.schedule_id}
                fill={horaSeleccionada?.id === horario.schedule_id ? 'solid' : 'outline'}
                onClick={() => onSeleccionHora(horario)}
                className={`horario-button ${
                  horario.availability_status === 'No Disponible' ? 'horario-no-disponible' : ''
                }`}
                color="primary"
                disabled={horario.availability_status === 'No Disponible'}
              >
                {`${formatearHora(horario.start)} - ${formatearHora(horario.finish)}`}
              </IonButton>
            ))}
          </div>
        </div>
      ))}
    </IonList>
  );
};

export default HorariosDisponibles;