import React from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import { ReservaDisponible } from '../../services/serviciosDeportivosService';

interface Props {
    horarios: ReservaDisponible[];
    fechaSeleccionada: Date;
    horaSeleccionada: string | null;
    onSeleccionHora: (scheduleId: number, hora: string) => void;
}

const HorariosDisponibles: React.FC<Props> = ({
    horarios,
    fechaSeleccionada,
    horaSeleccionada,
    onSeleccionHora
}) => {
    // Filtrar horarios por fecha seleccionada
    const horariosFiltrados = horarios.filter(horario => {
        const fechaHorario = new Date(horario.calendar_date);
        return fechaHorario.toDateString() === fechaSeleccionada.toDateString() &&
               horario.availability_status === "Disponible";
    });

    return (
        <IonList>
            {horariosFiltrados.map((horario) => (
                <IonItem
                    key={horario.schedule_id}
                    button
                    onClick={() => onSeleccionHora(horario.schedule_id, `${horario.start} - ${horario.finish}`)}
                    color={horaSeleccionada === `${horario.start} - ${horario.finish}` ? 'primary' : undefined}
                >
                    <IonLabel>
                        <h2>{horario.court_name}</h2>
                        <p>{`${horario.start} - ${horario.finish}`}</p>
                    </IonLabel>
                </IonItem>
            ))}
            {horariosFiltrados.length === 0 && (
                <IonItem>
                    <IonLabel>No hay horarios disponibles para esta fecha</IonLabel>
                </IonItem>
            )}
        </IonList>
    );
};

export default HorariosDisponibles;