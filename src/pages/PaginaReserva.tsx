// types.ts
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

// PaginaReserva.tsx
import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonButton, IonHeader, IonToolbar,
  IonButtons, IonIcon, IonPopover, IonModal, IonList, IonItem, IonLabel, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonTitle, IonSelect, IonSelectOption, IonSpinner
} from '@ionic/react';
import { personCircleOutline, keyOutline, chevronForwardOutline, checkmarkOutline } from 'ionicons/icons';
import Calendario from '../components/PaginaReserva/Calendario';
import HorariosDisponibles from '../components/PaginaReserva/HorariosDisponibles';
import { useCampus, getCampusNameById } from '../services/campusService';
import { Deporte } from '../services/serviciosDeportivosService';
import './PaginaReserva.css';

const PaginaReserva: React.FC = () => {
  const { campuses, loading, error, loadDeportes } = useCampus();
  
  const [step, setStep] = useState(1);
  const [campusSeleccionado, setCampusSeleccionado] = useState<number>(0);
  const [deportesDisponibles, setDeportesDisponibles] = useState<Deporte[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [horarios, setHorarios] = useState<Array<{id: number, hora: string, cancha: string}>>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
  const [showRutPopover, setShowRutPopover] = useState(false);
  const [showTokenPopover, setShowTokenPopover] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [horarioSeleccionadoId, setHorarioSeleccionadoId] = useState<number | null>(null);

  const obtenerHorariosDisponibles = async (fecha: Date, servicioId: number) => {
    try {
      const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/get_reservas_disponibles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: fecha.toISOString(),
          servicioId: servicioId
        })
      });
      
      const data: DisponibilidadHorario[] = await response.json();
      return data.filter(horario => horario.availability_status === 'Disponible')
                .map(horario => ({
                  id: horario.schedule_id,
                  hora: horario.start,
                  cancha: horario.court_name
                }));
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      return [];
    }
  };

  useEffect(() => {
    const inicializarCampus = async () => {
      if (campuses.length > 0 && campusSeleccionado === 0) {
        const primerCampus = campuses[0].id;
        setCampusSeleccionado(primerCampus);
        await loadDeportesForCampus(primerCampus);
      }
    };
    inicializarCampus();
  }, [campuses]);

  const loadDeportesForCampus = async (campusId: number) => {
    try {
      const deportes = await loadDeportes(campusId);
      setDeportesDisponibles(deportes);
      if (deportes.length > 0) {
        setServicioSeleccionado(deportes[0].name);
      }
    } catch (error) {
      console.error('Error al cargar deportes:', error);
    }
  };

  const handleCampusChange = async (nuevoId: number) => {
    setCampusSeleccionado(nuevoId);
    await loadDeportesForCampus(nuevoId);
    setStep(2);
  };

  const handleServicioChange = (nuevoServicio: string) => {
    setServicioSeleccionado(nuevoServicio);
    setStep(3);
  };

  const handleFechaChange = async (fecha: Date) => {
    setFechaSeleccionada(fecha);
    setIsLoadingHorarios(true);
    try {
      const horariosDisponibles = await obtenerHorariosDisponibles(fecha, parseInt(servicioSeleccionado));
      setHorarios(horariosDisponibles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingHorarios(false);
    }
    setStep(4);
  };

  const handleHoraChange = (hora: string, id: number) => {
    setHoraSeleccionada(hora);
    setHorarioSeleccionadoId(id);
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando campus...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardContent>
              <p>Error: {error}</p>
              <IonButton onClick={() => window.location.reload()}>Reintentar</IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowRutPopover(true)}>
              <IonIcon icon={personCircleOutline} />
            </IonButton>
          </IonButtons>
          <IonToolbar style={{ textAlign: 'center' }} mode="md">
            <div className="sub-title">
              <h2 className="main-title">Reserva</h2>
              <h2 className="main-title_">Deportiva_</h2>
            </div>
          </IonToolbar>
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
              onIonChange={(e) => handleCampusChange(e.detail.value)}
            >
              {campuses.map((campus) => (
                <IonSelectOption key={campus.id} value={campus.id}>
                  {campus.description}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonCardContent>
        </IonCard>

        {step >= 2 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Selecciona un servicio</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonSelect
                value={servicioSeleccionado}
                onIonChange={(e) => handleServicioChange(e.detail.value)}
              >
                {deportesDisponibles.map((deporte) => (
                  <IonSelectOption key={deporte.id} value={deporte.name}>
                    {deporte.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCardContent>
          </IonCard>
        )}

        {step >= 3 && (
          <IonCard className="calendario-card">
            <IonCardHeader>
              <IonCardTitle>Selecciona una fecha</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <Calendario 
                fechaSeleccionada={fechaSeleccionada} 
                onCambioFecha={handleFechaChange} 
              />
            </IonCardContent>
          </IonCard>
        )}

        {step >= 4 && (
          <IonCard className="horarios-card">
            <IonCardHeader>
              <IonCardTitle>Selecciona un horario</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {isLoadingHorarios ? (
                <IonSpinner name="crescent" />
              ) : horarios.length > 0 ? (
                <HorariosDisponibles 
                  horarios={horarios}
                  horaSeleccionada={horaSeleccionada}
                  onSeleccionHora={handleHoraChange}
                />
              ) : (
                <p>No hay horarios disponibles para la fecha seleccionada.</p>
              )}
            </IonCardContent>
          </IonCard>
        )}

        <IonButton 
          expand="block" 
          disabled={!horaSeleccionada} 
          onClick={() => setShowResumenModal(true)}
          className="ion-margin"
        >
          <IonIcon icon={chevronForwardOutline} /> Siguiente
        </IonButton>

        <IonPopover
          isOpen={showRutPopover}
          onDidDismiss={() => setShowRutPopover(false)}
        >
          <IonContent className="ion-padding">
            <p>RUT: 19.247.979-7</p>
          </IonContent>
        </IonPopover>

        <IonPopover
          isOpen={showTokenPopover}
          onDidDismiss={() => setShowTokenPopover(false)}
        >
          <IonContent className="ion-padding">
            <p>Tokens disponibles: 8</p>
          </IonContent>
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
                  <p>{getCampusNameById(campuses, campusSeleccionado)}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Tipo de servicio</h2>
                  <p>{servicioSeleccionado}</p>
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
            <IonButton 
              expand="block" 
              className="ion-margin"
              onClick={() => setShowResumenModal(false)}
            >
              <IonIcon icon={checkmarkOutline} /> Confirmar Reserva
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PaginaReserva;