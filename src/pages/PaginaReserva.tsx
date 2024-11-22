import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonButton, 
  IonHeader, 
  IonToolbar,
  IonButtons, 
  IonIcon, 
  IonPopover, 
  IonModal, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonCard, 
  IonCardContent,
  IonCardHeader, 
  IonCardTitle, 
  IonTitle, 
  IonSelect, 
  IonSelectOption, 
  IonSpinner, 
  IonToast
} from '@ionic/react';
import { 
  personCircleOutline, 
  keyOutline, 
  chevronForwardOutline, 
  checkmarkOutline 
} from 'ionicons/icons';
import { DisponibilidadHorario, HorarioSeleccionado } from '../interfaces/disponibilidad.interface';
import { ApiResponse, ReservaRequest } from '../interfaces/api.interface';
import { API_ENDPOINTS, DEFAULT_RUT } from '../constants/api.constants';
import { useCampus, getCampusNameById } from '../services/campusService';
import { Deporte } from '../services/serviciosDeportivosService';
import Calendario from '../components/PaginaReserva/Calendario';
import HorariosDisponibles from '../components/PaginaReserva/HorariosDisponibles';
import './PaginaReserva.css';

const PaginaReserva: React.FC = () => {
  const { campuses, loading, error, loadDeportes } = useCampus();
  
  // Estados
  const [step, setStep] = useState(1);
  const [campusSeleccionado, setCampusSeleccionado] = useState<number | null>(null);
  const [deportesDisponibles, setDeportesDisponibles] = useState<Deporte[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [horarios, setHorarios] = useState<DisponibilidadHorario[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState<HorarioSeleccionado | null>(null);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
  const [showRutPopover, setShowRutPopover] = useState(false);
  const [showTokenPopover, setShowTokenPopover] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const inicializarCampus = async () => {
      if (campuses.length > 0 && !campusSeleccionado) {
        setDeportesDisponibles([]);
        setServicioSeleccionado('');
      }
    };
    inicializarCampus();
  }, [campuses]);

  const loadDeportesForCampus = async (campusId: number) => {
    try {
      const deportes = await loadDeportes(campusId);
      setDeportesDisponibles(deportes);
    } catch (error) {
      console.error('Error al cargar deportes:', error);
      setDeportesDisponibles([]);
    }
  };

  const obtenerHorariosDisponibles = async (fecha: Date) => {
    setIsLoadingHorarios(true);
    try {
      const formattedDate = fecha.toISOString().split('T')[0];
      
      const requestData = {
        fecha: formattedDate,
        id: 1,
        sport_id: 1
      };

      const response = await fetch(API_ENDPOINTS.GET_RESERVAS_DISPONIBLES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Error en la petición');
      }

      const responseData: ApiResponse = await response.json();
      
      if (responseData.status === 200 && Array.isArray(responseData.data)) {
        const horariosDelDia = responseData.data.filter(horario => {
          const horarioDate = new Date(horario.calendar_date);
          const esHorarioDelDia = horarioDate.toDateString() === fecha.toDateString();
          const esServicioSeleccionado = horario.court_name.toLowerCase().includes(servicioSeleccionado.toLowerCase());
          
          return esHorarioDelDia && esServicioSeleccionado;
        });

        setHorarios(horariosDelDia);
      } else {
        console.error('Formato de respuesta inválido:', responseData);
        setHorarios([]);
      }

    } catch (error) {
      console.error('Error al obtener horarios:', error);
      setHorarios([]);
    } finally {
      setIsLoadingHorarios(false);
    }
  };

  const realizarReserva = async () => {
    if (!horaSeleccionada) {
      alert('Por favor selecciona un horario');
      return;
    }
  
    try {
      const formattedDate = fechaSeleccionada.toISOString().split('T')[0];
      
      const reservaData: ReservaRequest = {
        run: DEFAULT_RUT,
        register_date: formattedDate,
        schedule_id: horaSeleccionada.id,
      };
  
      console.log('Datos de reserva a enviar:', reservaData); // Para debug
  
      const response = await fetch(API_ENDPOINTS.POST_RESERVA, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify(reservaData)
      });
  
      const result = await response.json();
    console.log('Respuesta de la reserva:', result); // Para debug

    if (result.data == 'Ya existe una reserva para esa fecha y horario' ) {
      setToastMessage('Ya existe una reserva para esa fecha y horario');
      setShowToast(true);
    } else if (response.ok && result.status === 200) {
      setShowResumenModal(false);
      setToastMessage('Reserva Confirmada');
      setShowToast(true);
      // Resetear estados
      setHoraSeleccionada(null);
      setHorarios([]);
      setCampusSeleccionado(null);
      setServicioSeleccionado('');
      setStep(1);
    } else {
      throw new Error(result.message || 'Error al realizar la reserva');
    }
  } catch (error) {
      console.error('Error al realizar la reserva:', error);
      alert('Error al procesar la reserva: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleCampusChange = async (nuevoId: number) => {
    setCampusSeleccionado(nuevoId);
    await loadDeportesForCampus(nuevoId);
    setStep(2);
    setServicioSeleccionado('');
  };

  const handleServicioChange = (nuevoServicio: string) => {
    setServicioSeleccionado(nuevoServicio);
    setHoraSeleccionada(null);
    setHorarios([]);
    setStep(3);
  };

  const handleFechaChange = async (fecha: Date) => {
    setFechaSeleccionada(fecha);
    await obtenerHorariosDisponibles(fecha);
    setStep(4);
  };

  const handleHoraChange = (horarioCompleto: DisponibilidadHorario) => {
    setHoraSeleccionada({
      id: horarioCompleto.schedule_id,
      hora: `${horarioCompleto.start} - ${horarioCompleto.finish}`,
      cancha: horarioCompleto.court_name
    });
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
              placeholder="Selecciona un campus"
            >
              {campuses.map((campus) => (
                <IonSelectOption key={campus.id} value={campus.id}>
                  {campus.description}
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
            <IonSelect
              value={servicioSeleccionado}
              onIonChange={(e) => handleServicioChange(e.detail.value)}
              placeholder="Selecciona un servicio"
              disabled={!campusSeleccionado}
            >
              {deportesDisponibles.map((deporte) => (
                <IonSelectOption key={deporte.id} value={deporte.name}>
                  {deporte.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonCardContent>
        </IonCard>

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
                <div className="loading-container">
                  <IonSpinner name="crescent" />
                  <p>Cargando horarios disponibles...</p>
                </div>
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
                  <p>{getCampusNameById(campuses, campusSeleccionado || 0)}</p>
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
                  <h2>Horario y Cancha</h2>
                  <p>{horaSeleccionada ? `${horaSeleccionada.hora} - ${horaSeleccionada.cancha}` : ''}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Día de Reserva</h2>
                  <p>{formatearFecha(fechaSeleccionada)}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>RUT</h2>
                  <p>19.247.979-7</p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonButton 
              expand="block" 
              className="ion-margin"
              onClick={realizarReserva}
            >
              <IonIcon icon={checkmarkOutline} /> Confirmar Reserva
            </IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="middle"
          color={toastMessage === 'Reserva Confirmada' ? 'success' : 'warning'}
          buttons={[
            {
              icon: 'checkmark-outline',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PaginaReserva;