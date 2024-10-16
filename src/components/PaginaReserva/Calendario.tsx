import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import './Calendario.css'; // Asegúrate de crear este archivo CSS

interface PropiedadesCalendario {
  fechaSeleccionada: Date;
  onCambioFecha: (fecha: Date) => void;
}

const Calendario: React.FC<PropiedadesCalendario> = ({ fechaSeleccionada, onCambioFecha }) => {
  
  const generarFechas = (inicio: Date) => {
    const fechas = [];
    let diaActual = new Date(inicio);
    diaActual.setHours(0, 0, 0, 0);

    while (fechas.length < 6) {
      if (diaActual.getDay() !== 0 && diaActual.getDay() !== 6) {
        fechas.push(new Date(diaActual));
      }
      diaActual.setDate(diaActual.getDate() + 1);
    }
    
    return fechas;
  };

  const formatoDia = (fecha: Date) => {
    const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    return dias[fecha.getDay()];
  };

  const avanzarSemana = () => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    while (nuevaFecha.getDay() === 0 || nuevaFecha.getDay() === 6) {
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    }
    onCambioFecha(nuevaFecha);
  };

  const retrocederSemana = () => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    while (nuevaFecha.getDay() === 0 || nuevaFecha.getDay() === 6) {
      nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (nuevaFecha >= hoy) {
      onCambioFecha(nuevaFecha);
    } else {
      onCambioFecha(hoy);
    }
  };

  const fechaInicio = new Date(fechaSeleccionada);
  while (fechaInicio.getDay() !== 1) {
    fechaInicio.setDate(fechaInicio.getDate() - 1);
  }

  const fechasMostradas = generarFechas(fechaInicio);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    <div className="calendario">
      <IonButton fill="clear" className="flecha-fija flecha-izquierda" onClick={retrocederSemana} disabled={fechaInicio <= hoy}>
        <IonIcon icon={chevronBackOutline} />
      </IonButton>
      <div className="dias-contenedor">
        {fechasMostradas.map((fecha, indice) => (
          <IonButton 
            key={indice}
            fill={fecha.toDateString() === fechaSeleccionada.toDateString() ? 'solid' : 'clear'}
            onClick={() => onCambioFecha(fecha)}
            disabled={fecha < hoy}
            className={`boton-dia ${fecha.toDateString() === hoy.toDateString() ? 'hoy' : ''}`}
          >
            <div className="contenido-dia">
              <span className="numero-dia">{fecha.getDate()}</span>
              <span className="nombre-dia">{formatoDia(fecha)}</span>
            </div>
          </IonButton>
        ))}
      </div>
      <IonButton fill="clear" className="flecha-fija flecha-derecha" onClick={avanzarSemana}>
        <IonIcon icon={chevronForwardOutline} />
      </IonButton>
    </div>
  );
};

export default Calendario;