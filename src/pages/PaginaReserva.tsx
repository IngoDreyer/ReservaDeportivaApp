import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonButton, IonHeader, IonToolbar,
  IonIcon, IonModal, IonList, IonItem, IonLabel, 
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, 
  IonTitle, IonSelect, IonSelectOption, IonSpinner, 
  IonToast, IonSegment, IonSegmentButton, IonAccordionGroup, 
  IonAccordion, IonGrid, IonRow, IonCol, IonRefresher,
  IonRefresherContent, IonButtons
} from '@ionic/react';
import { 
  closeCircleOutline, chevronForwardOutline, checkmarkOutline,
  calendarOutline, timeOutline, locationOutline, footballOutline 
} from 'ionicons/icons';
import { DisponibilidadHorario, HorarioSeleccionado } from '../interfaces/disponibilidad.interface';
import { ApiResponse, ReservaRequest } from '../interfaces/api.interface';
import { API_ENDPOINTS } from '../constants/api.constants';
import { useCampus, getCampusNameById } from '../services/campusService';
import { Deporte } from '../services/serviciosDeportivosService';
import { getReservasByRun } from '../services/historialService';
import Calendario from '../components/PaginaReserva/Calendario';
import HorariosDisponibles from '../components/PaginaReserva/HorariosDisponibles';
import './PaginaReserva.css';

// Interface que define la estructura del estado global del componente
interface State {
  step: number;
  selectedSegment: string;
  campusSeleccionado: number | null;
  deportesDisponibles: Deporte[];
  servicioSeleccionado: string;
  fechaSeleccionada: Date;
  horarios: DisponibilidadHorario[];
  horaSeleccionada: HorarioSeleccionado | null;
  isLoadingHorarios: boolean;
  showResumenModal: boolean;
  showToast: boolean;
  toastMessage: string;
  cancellingReservationId: number | null;
  reservasHistorial: any[];
  loadingHistorial: boolean;
  errorHistorial: string | null;
}

const PaginaReserva: React.FC = () => {
  const { campuses, loading, error, loadDeportes } = useCampus();
  
  // Estado global del componente
  const [state, setState] = useState<State>({
    step: 1,
    selectedSegment: 'reserva',
    campusSeleccionado: null,
    deportesDisponibles: [],
    servicioSeleccionado: '',
    fechaSeleccionada: new Date(),
    horarios: [],
    horaSeleccionada: null,
    isLoadingHorarios: false,
    showResumenModal: false,
    showToast: false,
    toastMessage: '',
    cancellingReservationId: null,
    reservasHistorial: [],
    loadingHistorial: false,
    errorHistorial: null
  });

  // Obtiene el RUT desde los parámetros de la URL
  const rut = parseInt(new URLSearchParams(location.search).get('rut') || '0');

  // Efecto para inicializar deportes cuando cambian los campus
  useEffect(() => {
    if (campuses.length > 0 && !state.campusSeleccionado) {
      setState(prev => ({
        ...prev,
        deportesDisponibles: [],
        servicioSeleccionado: ''
      }));
    }
  }, [campuses]);

  // Formatea una fecha a string en formato local español
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Carga los deportes disponibles para un campus específico
  const loadDeportesForCampus = async (campusId: number) => {
    try {
      const deportes = await loadDeportes(campusId);
      setState(prev => ({ ...prev, deportesDisponibles: deportes }));
    } catch (error) {
      console.error('Error al cargar deportes:', error);
      setState(prev => ({ ...prev, deportesDisponibles: [] }));
    }
  };

  // Carga el historial de reservas del usuario
  const loadHistorial = async () => {
    setState(prev => ({ ...prev, loadingHistorial: true, errorHistorial: null }));
    try {
      const data = await getReservasByRun(rut);
      const today = new Date().toISOString().split('T')[0];
      
      const filteredData = data
        .filter(reserva => reserva.register_date.split('T')[0] >= today)
        .sort((a, b) => {
          if (a.state !== b.state) return b.state ? 1 : -1;
          return new Date(a.register_date).getTime() - new Date(b.register_date).getTime();
        });

      setState(prev => ({ ...prev, reservasHistorial: filteredData }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        errorHistorial: 'Error al cargar las reservas',
        showToast: true,
        toastMessage: 'Error al cargar el historial. Por favor intente nuevamente.'
      }));
    } finally {
      setState(prev => ({ ...prev, loadingHistorial: false }));
    }
  };

  // Maneja la cancelación de una reserva
  const handleCancelReservation = async (reservationId: number) => {
    setState(prev => ({ ...prev, cancellingReservationId: reservationId }));
    try {
      const response = await fetch('https://apptuiback.utalca.cl/reservaComplejoDeportivo/actualizar_reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: reservationId })
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          showToast: true,
          toastMessage: 'Reserva cancelada exitosamente'
        }));
        await loadHistorial();
      } else {
        throw new Error('Error al cancelar la reserva');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        showToast: true,
        toastMessage: 'Error al cancelar la reserva. Por favor intente nuevamente.'
      }));
    } finally {
      setState(prev => ({ ...prev, cancellingReservationId: null }));
    }
  };

  // Maneja el cambio entre pestañas de reserva y mis reservas
  const handleSegmentChange = (e: CustomEvent) => {
    const newSegment = e.detail.value;
    setState(prev => ({ ...prev, selectedSegment: newSegment }));
    if (newSegment === 'misReservas') {
      loadHistorial();
    }
  };

  // Maneja la actualización del historial al hacer pull-to-refresh
  const handleHistorialRefresh = async (event: CustomEvent) => {
    try {
      await loadHistorial();
      setState(prev => ({
        ...prev,
        showToast: true,
        toastMessage: 'Historial actualizado correctamente'
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        showToast: true,
        toastMessage: 'Error al actualizar el historial'
      }));
    } finally {
      event.detail.complete();
    }
  };

  // Obtiene los horarios disponibles para una fecha específica
  const obtenerHorariosDisponibles = async (fecha: Date) => {
    setState(prev => ({ ...prev, isLoadingHorarios: true }));
    try {
      const formattedDate = fecha.toISOString().split('T')[0];
      const response = await fetch(API_ENDPOINTS.GET_RESERVAS_DISPONIBLES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          fecha: formattedDate,
          id: 1,
          sport_id: 1
        })
      });

      if (!response.ok) throw new Error('Error en la petición');

      const responseData: ApiResponse = await response.json();
      
      if (responseData.status === 200 && Array.isArray(responseData.data)) {
        const horariosDelDia = responseData.data.filter(horario => {
          const horarioDate = new Date(horario.calendar_date);
          return horarioDate.toDateString() === fecha.toDateString() &&
                 horario.court_name.toLowerCase().includes(state.servicioSeleccionado.toLowerCase());
        });
        setState(prev => ({ ...prev, horarios: horariosDelDia }));
      }
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      setState(prev => ({ ...prev, horarios: [] }));
    } finally {
      setState(prev => ({ ...prev, isLoadingHorarios: false }));
    }
  };

  // Realiza una nueva reserva
  const realizarReserva = async () => {
    if (!state.horaSeleccionada) {
      alert('Por favor selecciona un horario');
      return;
    }
  
    try {
      const formattedDate = state.fechaSeleccionada.toISOString().split('T')[0];
      const response = await fetch(API_ENDPOINTS.POST_RESERVA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          run: rut,
          register_date: formattedDate,
          schedule_id: state.horaSeleccionada.id,
        })
      });

      const result = await response.json();

      if (result.data === 'Ya existe una reserva para esa fecha y horario') {
        setState(prev => ({
          ...prev,
          showToast: true,
          toastMessage: 'Ya existe una reserva para esa fecha y horario'
        }));
      } else if (response.ok && result.status === 200) {
        setState(prev => ({
          ...prev,
          showResumenModal: false,
          showToast: true,
          toastMessage: 'Reserva Confirmada',
          horaSeleccionada: null,
          horarios: [],
          campusSeleccionado: null,
          servicioSeleccionado: '',
          step: 1
        }));
      } else {
        throw new Error(result.message || 'Error al realizar la reserva');
      }
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      alert('Error al procesar la reserva: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // Maneja el cambio de campus seleccionado
  const handleCampusChange = async (nuevoId: number) => {
    setState(prev => ({
      ...prev,
      campusSeleccionado: nuevoId,
      step: 2,
      servicioSeleccionado: ''
    }));
    await loadDeportesForCampus(nuevoId);
  };

  // Maneja el cambio de servicio seleccionado
  const handleServicioChange = (nuevoServicio: string) => {
    setState(prev => ({
      ...prev,
      servicioSeleccionado: nuevoServicio,
      horaSeleccionada: null,
      horarios: [],
      step: 3
    }));
  };

  // Maneja el cambio de fecha seleccionada
  const handleFechaChange = async (fecha: Date) => {
    setState(prev => ({
      ...prev,
      fechaSeleccionada: fecha,
      step: 4
    }));
    await obtenerHorariosDisponibles(fecha);
  };

  // Maneja el cambio de hora seleccionada
  const handleHoraChange = (horarioCompleto: DisponibilidadHorario) => {
    setState(prev => ({
      ...prev,
      horaSeleccionada: {
        id: horarioCompleto.schedule_id,
        hora: `${horarioCompleto.start} - ${horarioCompleto.finish}`,
        cancha: horarioCompleto.court_name
      }
    }));
  };

  // Renderiza pantalla de carga
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

  // Renderiza pantalla de error
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
          <IonToolbar style={{ textAlign: 'center' }} mode="md">
            <div className="sub-title">
              <h2 className="main-title">Reserva</h2>
              <h2 className="main-title_">Deportiva_</h2>
            </div>
            <IonSegment value={state.selectedSegment} onIonChange={handleSegmentChange}>
              <IonSegmentButton value="reserva">
                <IonLabel>Reserva</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="misReservas">
                <IonLabel>Mis Reservas</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {state.selectedSegment === 'reserva' ? (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Selecciona un campus</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonSelect
                  value={state.campusSeleccionado}
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
                  value={state.servicioSeleccionado}
                  onIonChange={(e) => handleServicioChange(e.detail.value)}
                  placeholder="Selecciona un servicio"
                  disabled={!state.campusSeleccionado}
                >
                  {state.deportesDisponibles.map((deporte) => (
                    <IonSelectOption key={deporte.id} value={deporte.name}>
                      {deporte.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonCardContent>
            </IonCard>

            {state.step >= 3 && (
              <IonCard className="calendario-card">
                <IonCardHeader>
                  <IonCardTitle>Selecciona una fecha</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <Calendario 
                    fechaSeleccionada={state.fechaSeleccionada} 
                    onCambioFecha={handleFechaChange} 
                  />
                </IonCardContent>
              </IonCard>
            )}

            {state.step >= 4 && (
              <IonCard className="horarios-card">
                <IonCardHeader>
                  <IonCardTitle>Selecciona un horario</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {state.isLoadingHorarios ? (
                    <div className="loading-container">
                      <IonSpinner name="crescent" />
                      <p>Cargando horarios disponibles...</p>
                    </div>
                  ) : state.horarios.length > 0 ? (
                    <HorariosDisponibles 
                      horarios={state.horarios}
                      horaSeleccionada={state.horaSeleccionada}
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
              disabled={!state.horaSeleccionada} 
              onClick={() => setState(prev => ({ ...prev, showResumenModal: true }))}
              className="ion-margin"
            >
              <IonIcon icon={chevronForwardOutline} /> Siguiente
            </IonButton>
          </>
        ) : (
          <>
            <IonRefresher slot="fixed" onIonRefresh={handleHistorialRefresh}>
              <IonRefresherContent />
            </IonRefresher>

            {state.loadingHistorial ? (
                <div className="loading-container">
                  <IonSpinner />
                  <p>Cargando reservas...</p>
                </div>
              ) : state.errorHistorial ? (
                <div className="error-container ion-padding">
                  <p>{state.errorHistorial}</p>
                </div>
              ) : (
                <IonAccordionGroup>
                  {state.reservasHistorial.map((reserva, index) => (
                    <IonAccordion value={`reserva-${index}`} key={index}>
                      <IonItem slot="header" className="accordion-header">
                        <IonGrid>
                          <IonRow class="ion-align-items-center">
                            <IonCol size="4" className="ion-text-wrap">
                              <strong>{reserva.court}</strong>
                            </IonCol>
                            <IonCol size="4" className="ion-text-center">
                              {formatDate(reserva.register_date)}
                            </IonCol>
                            <IonCol size="3" className="ion-text-center">
                              {reserva.start}
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonItem>
                      
                      <div className="accordion-content" slot="content">
                        <IonGrid>
                          <IonRow>
                            <IonCol size="12">
                              <IonItem lines="none">
                                <IonIcon icon={footballOutline} slot="start" />
                                <IonLabel>
                                  <h1>Tipo de Cancha</h1>
                                  <p>{reserva.court}</p>
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol size="12">
                              <IonItem lines="none">
                                <IonIcon icon={locationOutline} slot="start" />
                                <IonLabel>
                                  <h1>Campus</h1>
                                  <p>{reserva.headquarter}</p>
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol size="12">
                              <IonItem lines="none">
                                <IonIcon icon={calendarOutline} slot="start" />
                                <IonLabel>
                                  <h1>Fecha</h1>
                                  <p>{formatDate(reserva.register_date)}</p>
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                            <IonCol size="6">
                              <IonItem lines="none">
                                <IonIcon icon={timeOutline} slot="start" />
                                <IonLabel>
                                  <h1>Hora Inicio</h1>
                                  <p>{reserva.start}</p>
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                            <IonCol size="6">
                              <IonItem lines="none">
                                <IonIcon icon={timeOutline} slot="start" />
                                <IonLabel>
                                  <h1>Hora Termino</h1>
                                  <p>{reserva.finish}</p>
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                          </IonRow>

                          {reserva.state && (
                            <IonRow>
                              <IonCol size="12">
                                <IonButton 
                                  color="danger" 
                                  fill="outline" 
                                  expand="block"
                                  className="ion-margin-top"
                                  disabled={state.cancellingReservationId === reserva.id}
                                  onClick={() => handleCancelReservation(reserva.id)}
                                >
                                  {state.cancellingReservationId === reserva.id ? (
                                    <IonSpinner name="crescent" />
                                  ) : (
                                    <>
                                      <IonIcon icon={closeCircleOutline} slot="start" />
                                      Cancelar Reserva
                                    </>
                                  )}
                                </IonButton>
                              </IonCol>
                            </IonRow>
                          )}
                        </IonGrid>
                      </div>
                    </IonAccordion>
                  ))}
                </IonAccordionGroup>
              )}

            {state.reservasHistorial.length === 0 && !state.loadingHistorial && !state.errorHistorial && (
              <div className="ion-padding ion-text-center">
                <p>No se encontraron reservas</p>
              </div>
            )}
          </>
        )}

        <IonModal isOpen={state.showResumenModal} onDidDismiss={() => setState(prev => ({ ...prev, showResumenModal: false }))}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Resumen de Reserva</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setState(prev => ({ ...prev, showResumenModal: false }))}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h1>Campus</h1>
                  <p>{getCampusNameById(campuses, state.campusSeleccionado || 0)}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h1>Tipo de servicio</h1>
                  <p>{state.servicioSeleccionado}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h1>Horario y Cancha</h1>
                  <p>{state.horaSeleccionada ? `${state.horaSeleccionada.hora} - ${state.horaSeleccionada.cancha}` : ''}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h1>Día de Reserva</h1>
                  <p>{state.fechaSeleccionada.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
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
          isOpen={state.showToast}
          onDidDismiss={() => setState(prev => ({ ...prev, showToast: false }))}
          message={state.toastMessage}
          duration={2000}
          position="middle"
          color={state.toastMessage === 'Reserva Confirmada' ? 'success' : 'warning'}
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