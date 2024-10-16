import React from 'react';
import { IonButton } from '@ionic/react';

interface PropiedadesHorariosDisponibles {
  horarios: string[];
  horaSeleccionada: string;
  onSeleccionHora: (hora: string) => void;
}

const HorariosDisponibles: React.FC<PropiedadesHorariosDisponibles> = ({ horarios, horaSeleccionada, onSeleccionHora }) => {
  return (
    <div className="horarios-disponibles">
      {horarios.map((hora, indice) => (
        <IonButton 
          key={indice}
          fill={hora === horaSeleccionada ? 'solid' : 'clear'}
          onClick={() => onSeleccionHora(hora)}
        >
          {hora}
        </IonButton>
      ))}
    </div>
  );
};

export default HorariosDisponibles;