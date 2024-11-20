import React from 'react';
import { IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import './HorariosDisponibles.css';

interface Horario {
  id: number;
  hora: string;
  cancha: string;
}

interface HorariosDisponiblesProps {
  horarios: Horario[];
  horaSeleccionada: string;
  onSeleccionHora: (hora: string, id: number) => void;
}

const HorariosDisponibles: React.FC<HorariosDisponiblesProps> = ({
  horarios,
  horaSeleccionada,
  onSeleccionHora,
}) => {
  const formatHora = (hora: string) => {
    const [hours, minutes] = hora.split(':');
    return `${hours}:${minutes}`;
  };

  // Agrupar horarios por cancha
  const horariosPorCancha = horarios.reduce((acc, horario) => {
    if (!acc[horario.cancha]) {
      acc[horario.cancha] = [];
    }
    acc[horario.cancha].push(horario);
    return acc;
  }, {} as Record<string, Horario[]>);

  return (
    <IonList>
      {Object.entries(horariosPorCancha).map(([cancha, horariosCancha]) => (
        <div key={cancha}>
          <h4 className="cancha-title">{cancha}</h4>
          <div className="horarios-grid">
            {horariosCancha.map((horario) => (
              <IonButton
                key={horario.id}
                fill={horaSeleccionada === formatHora(horario.hora) ? 'solid' : 'outline'}
                onClick={() => onSeleccionHora(formatHora(horario.hora), horario.id)}
                className="horario-button"
              >
                {formatHora(horario.hora)}
              </IonButton>
            ))}
          </div>
        </div>
      ))}
    </IonList>
  );
};

export default HorariosDisponibles;