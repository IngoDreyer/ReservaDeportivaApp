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
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonAccordionGroup,
  IonAccordion,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { 
  closeCircleOutline,
  chevronForwardOutline, 
  checkmarkOutline,
  calendarOutline, 
  timeOutline, 
  locationOutline,
  footballOutline 
} from 'ionicons/icons';
import { DisponibilidadHorario, HorarioSeleccionado } from '../interfaces/disponibilidad.interface';
import { ApiResponse, ReservaRequest } from '../interfaces/api.interface';
import { API_ENDPOINTS, DEFAULT_RUT } from '../constants/api.constants';
import { useCampus, getCampusNameById } from '../services/campusService';
import { Deporte } from '../services/serviciosDeportivosService';
import { getReservasByRun, HistorialReserva } from '../services/historialService';
import Calendario from '../components/PaginaReserva/Calendario';
import HorariosDisponibles from '../components/PaginaReserva/HorariosDisponibles';
import './PaginaReserva.css';

const PaginaReserva: React.FC = () => {
  const { campuses, loading, error, loadDeportes } = useCampus();
  
  // Estados para reserva
  const [step, setStep] = useState(1);
  const [selectedSegment, setSelectedSegment] = useState<string>('reserva');
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

  // Estados para historial
  const [reservasHistorial, setReservasHistorial] = useState<HistorialReserva[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  useEffect(() => {
    const inicializarCampus = async () => {
      if (campuses.length > 0 && !campusSeleccionado) {
        setDeportesDisponibles([]);
        setServicioSeleccionado('');
      }
    };
    inicializarCampus();
  }, [campuses]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const loadDeportesForCampus = async (campusId: number) => {
    try {
      const deportes = await loadDeportes(campusId);
      setDeportesDisponibles(deportes);
    } catch (error) {
      console.error('Error al cargar deportes:', error);
      setDeportesDisponibles([]);
    }
  };

  const loadHistorial = async () => {
    try {
      setLoadingHistorial(true);
      setErrorHistorial(null);
      const data = await getReservasByRun('19247979');
      
      // Obtener fecha actual en formato ISO y extraer solo la fecha
      const today = new Date().toISOString().split('T')[0];
  
      // Filtrar reservas futuras y de hoy
      const filteredData = data.filter(reserva => {
        // Extraer solo la fecha del timestamp de la reserva
        const reservaDate = reserva.register_date.split('T')[0];
        console.log('Fecha reserva:', reservaDate, 'Hoy:', today); // Para debugging
        return reservaDate >= today;
      });
  
      // Ordenar las reservas filtradas
      const sortedData = filteredData.sort((a, b) => {
        if (a.state !== b.state) return b.state ? 1 : -1;
        
        return new Date(a.register_date).getTime() - new Date(b.register_date).getTime();
      });
  
      console.log('Datos filtrados:', filteredData); // Para debugging
      setReservasHistorial(sortedData);
    } catch (err) {
      setErrorHistorial('Error al cargar las reservas');
      setToastMessage('Error al cargar el historial. Por favor intente nuevamente.');
      setShowToast(true);
    } finally {
      setLoadingHistorial(false);
    }
  };
  const handleSegmentChange = (e: CustomEvent) => {
    const newSegment = e.detail.value;
    setSelectedSegment(newSegment);
    if (newSegment === 'misReservas') {
      loadHistorial();
    }
  };

  const handleHistorialRefresh = async (event: CustomEvent) => {
    try {
      await loadHistorial();
      setToastMessage('Historial actualizado correctamente');
      setShowToast(true);
    } catch (err) {
      setToastMessage('Error al actualizar el historial');
      setShowToast(true);
    } finally {
      event.detail.complete();
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
  
      const response = await fetch(API_ENDPOINTS.POST_RESERVA, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify(reservaData)
      });
  
      const result = await response.json();

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
          <IonToolbar style={{ textAlign: 'center' }} mode="md">
            <div className="sub-title">
              <h2 className="main-title">Reserva</h2>
              <h2 className="main-title_">Deportiva_</h2>
            </div>
            <IonSegment value={selectedSegment} onIonChange={handleSegmentChange}>
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
        {selectedSegment === 'reserva' ? (
          <>
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
          </>
        ) : (
          <>
            <IonRefresher slot="fixed" onIonRefresh={handleHistorialRefresh}>
              <IonRefresherContent />
            </IonRefresher>

            {loadingHistorial ? (
                <div className="loading-container">
                  <IonSpinner />
                  <p>Cargando reservas...</p>
                </div>
              ) : errorHistorial ? (
                <div className="error-container ion-padding">
                  <p>{errorHistorial}</p>
                </div>
              ) : (
                <IonAccordionGroup>
                  {reservasHistorial.map((reserva, index) => (
                    <IonAccordion value={`reserva-${index}`} key={index}>
                      <IonItem slot="header" className="accordion-header">
                        <IonGrid>
                          <IonRow class="ion-align-items-center">
                            <IonCol size="4" className="ion-text-wrap">
                              <strong>{reserva.sport}</strong>
                            </IonCol>
                            <IonCol size="4" className="ion-text-center">
                              {formatDate(reserva.register_date)}
                            </IonCol>
                            <IonCol size="3" className="ion-text-center">
                              {reserva.start}
                            </IonCol>
                            <IonCol size="1">
                              <IonBadge color={reserva.state ? 'success' : 'medium'}>
                                {reserva.state ? 'A' : 'I'}
                              </IonBadge>
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
                                  <h2>Tipo de Cancha</h2>
                                  <p>{reserva.sport}</p>
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol size="12">
                              <IonItem lines="none">
                                <IonIcon icon={locationOutline} slot="start" />
                                <IonLabel>
                                  <h2>Campus</h2>
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
                                  <h2>Fecha</h2>
                                  <p>{formatDate(reserva.register_date)}</p>
                                </IonLabel>
                              </IonItem>
                            </IonCol>
                            <IonCol size="6">
                              <IonItem lines="none">
                                <IonIcon icon={timeOutline} slot="start" />
                                <IonLabel>
                                  <h2>Hora</h2>
                                  <p>{reserva.start}</p>
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
                                >
                                  <IonIcon icon={closeCircleOutline} slot="start" />
                                  Cancelar Reserva
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

            {reservasHistorial.length === 0 && !loadingHistorial && !errorHistorial && (
              <div className="ion-padding ion-text-center">
                <p>No se encontraron reservas</p>
              </div>
            )}
          </>
        )}

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
                  <p>{fechaSeleccionada.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
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