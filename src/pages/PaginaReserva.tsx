import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonButton, IonHeader, IonToolbar,
  IonButtons, IonIcon, IonPopover, IonModal, IonList, IonItem, IonLabel, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonTitle, IonSelect, IonSelectOption
} from '@ionic/react';
import { personCircleOutline, keyOutline, chevronDownOutline, chevronForwardOutline, checkmarkOutline } from 'ionicons/icons';
import Calendario from '../components/PaginaReserva/Calendario';
import HorariosDisponibles from '../components/PaginaReserva/HorariosDisponibles';
import { obtenerHorarios } from '../components/PaginaReserva/obtenerHorarios';
import './PaginaReserva.css';

const PaginaReserva: React.FC = () => {
  const [campusSeleccionado, setCampusSeleccionado] = useState<string>('Talca');
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('tenis');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [showRutPopover, setShowRutPopover] = useState(false);
  const [showTokenPopover, setShowTokenPopover] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);

  const campusServicios = {
    Talca: ['Tenis', 'Fútbol', 'Gimnasio'],
    Santiago: ['Gimnasio'],
    Curico: ['Gimnasio']
  };

  const horarios = obtenerHorarios(servicioSeleccionado, fechaSeleccionada);

  useEffect(() => {
    setHoraSeleccionada('');
    setServicioSeleccionado(campusServicios[campusSeleccionado][0].toLowerCase());
  }, [campusSeleccionado]);

  const manejarCambioCampus = (nuevoCampus: string) => {
    setCampusSeleccionado(nuevoCampus);
  };

  const manejarCambioServicio = (nuevoServicio: string) => {
    setServicioSeleccionado(nuevoServicio);
    setShowServicioModal(false);
  };

  const manejarCambioFecha = (fecha: Date) => {
    setFechaSeleccionada(fecha);
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowRutPopover(true)}>
              <IonIcon icon={personCircleOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle className="custom-title">Reserva </IonTitle>
          <IonTitle className="custom-title">       Deportiva_</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowTokenPopover(true)}>
              <IonIcon icon={keyOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          
          <IonCardHeader>
            <IonCardTitle>Selecciona un campus</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSelect
              value={campusSeleccionado}
              onIonChange={(e) => manejarCambioCampus(e.detail.value)}
            >
              {Object.keys(campusServicios).map((campus) => (
                <IonSelectOption key={campus} value={campus}>
                  {campus}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonCardContent>


        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Selecciona un servicio</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="servicio-selector" onClick={() => setShowServicioModal(true)}>
              <span>{servicioSeleccionado.charAt(0).toUpperCase() + servicioSeleccionado.slice(1)}</span>
              <IonIcon icon={chevronDownOutline} />
            </div>
          </IonCardContent>
        </IonCard>

        <IonModal 
          isOpen={showServicioModal} 
          onDidDismiss={() => setShowServicioModal(false)}
          className="servicio-modal"
          breakpoints={[0, 0.25, 0.5, 0.75]}
          initialBreakpoint={0.25}
        >
          <div className="modal-content">
            <h2>Tipo de servicio</h2>
            <IonList>
            {campusServicios[campusSeleccionado].map((servicio) => (
                <IonItem 
                  key={servicio} 
                  button 
                  onClick={() => manejarCambioServicio(servicio.toLowerCase())}
                  className={servicioSeleccionado === servicio.toLowerCase() ? 'item-selected' : ''}
                >
                  <IonLabel>{servicio}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>
        </IonModal>
        
        <IonCard className="calendario-card">
          <IonCardHeader>
            <IonCardTitle>Selecciona una fecha</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <Calendario 
              fechaSeleccionada={fechaSeleccionada} 
              onCambioFecha={manejarCambioFecha} 
            />
          </IonCardContent>
        </IonCard>
        
        <IonCard className="horarios-card">
          <IonCardHeader>
            <IonCardTitle>Selecciona un horario</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {horarios.length > 0 ? (
              <HorariosDisponibles 
                horarios={horarios} 
                horaSeleccionada={horaSeleccionada}
                onSeleccionHora={setHoraSeleccionada}
              />
            ) : (
              <p>No hay horarios disponibles para la fecha seleccionada.</p>
            )}
          </IonCardContent>
        </IonCard>
        
        <IonButton expand="block" disabled={!horaSeleccionada} onClick={() => setShowResumenModal(true)}>
          <IonIcon icon={chevronForwardOutline} /> Siguiente
        </IonButton>

        <IonPopover
          isOpen={showRutPopover}
          onDidDismiss={() => setShowRutPopover(false)}
        >
          <p>RUT: 19.247.979-7</p>
        </IonPopover>

        <IonPopover
          isOpen={showTokenPopover}
          onDidDismiss={() => setShowTokenPopover(false)}
        >
          <p>Tokens disponibles: 8</p>
        </IonPopover>

        <IonModal isOpen={showResumenModal} onDidDismiss={() => setShowResumenModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Resumen de Reserva</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowResumenModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>Campus</h2>
                  <p>{campusSeleccionado}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Tipo de servicio</h2>
                  <p>{servicioSeleccionado.charAt(0).toUpperCase() + servicioSeleccionado.slice(1)}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Horario</h2>
                  <p>{horaSeleccionada}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Día de Reserva</h2>
                  <p>{formatearFecha(fechaSeleccionada)}</p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonButton expand="block" onClick={() => setShowResumenModal(false)}>
              <IonIcon icon={checkmarkOutline} /> Confirmar Reserva
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PaginaReserva;