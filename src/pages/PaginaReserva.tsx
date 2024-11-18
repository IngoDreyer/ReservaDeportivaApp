import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonButton, IonHeader, IonToolbar,
  IonButtons, IonIcon, IonPopover, IonModal, IonList, IonItem, IonLabel, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonTitle, IonSelect, IonSelectOption, IonSpinner
} from '@ionic/react';
import { personCircleOutline, keyOutline, chevronForwardOutline, checkmarkOutline } from 'ionicons/icons';
import Calendario from '../components/PaginaReserva/Calendario';
import HorariosDisponibles from '../components/PaginaReserva/HorariosDisponibles';
import { obtenerHorarios } from '../components/PaginaReserva/obtenerHorarios';
import { useCampus, getCampusNameById } from '../services/campusService';
import { Deporte } from '../services/serviciosDeportivosService';
import './PaginaReserva.css';

const PaginaReserva: React.FC = () => {
  const { campuses, loading, error, loadDeportes } = useCampus();
  
  // Estados del componente
  const [campusSeleccionado, setCampusSeleccionado] = useState<number>(0);
  const [deportesDisponibles, setDeportesDisponibles] = useState<Deporte[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [showRutPopover, setShowRutPopover] = useState(false);
  const [showTokenPopover, setShowTokenPopover] = useState(false);
  const [showResumenModal, setShowResumenModal] = useState(false);

  // Establecer valores iniciales cuando se cargan los campus
  useEffect(() => {
    const inicializarCampus = async () => {
      if (campuses.length > 0 && campusSeleccionado === 0) {
        const primerCampus = campuses[0].id;
        setCampusSeleccionado(primerCampus);
        try {
          const deportes = await loadDeportes(primerCampus);
          setDeportesDisponibles(deportes);
          if (deportes.length > 0) {
            setServicioSeleccionado(deportes[0].name.toLowerCase());
          }
        } catch (error) {
          console.error('Error al cargar deportes iniciales:', error);
        }
      }
    };
    inicializarCampus();
  }, [campuses, campusSeleccionado, loadDeportes]);

  // Actualizar deportes cuando cambia el campus
  useEffect(() => {
    const actualizarDeportes = async () => {
      if (campusSeleccionado) {
        try {
          const deportes = await loadDeportes(campusSeleccionado);
          setDeportesDisponibles(deportes);
          if (deportes.length > 0) {
            setServicioSeleccionado(deportes[0].name.toLowerCase());
          }
        } catch (error) {
          console.error('Error al cargar deportes:', error);
        }
      }
    };
    actualizarDeportes();
  }, [campusSeleccionado, loadDeportes]);

  // Manejadores de eventos
  const manejarCambioCampus = (nuevoId: number) => {
    setCampusSeleccionado(nuevoId);
  };

  const manejarCambioServicio = (nuevoServicio: string) => {
    setServicioSeleccionado(nuevoServicio);
  };

  const manejarCambioFecha = (fecha: Date) => {
    setFechaSeleccionada(fecha);
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Obtener horarios
  const horarios = obtenerHorarios(servicioSeleccionado, fechaSeleccionada);

  // Renderizar estado de carga
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

  // Renderizar estado de error
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
              onIonChange={(e) => manejarCambioCampus(e.detail.value)}
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
              onIonChange={(e) => manejarCambioServicio(e.detail.value)}
            >
              {deportesDisponibles.map((deporte) => (
                <IonSelectOption key={deporte.id} value={deporte.name.toLowerCase()}>
                  {deporte.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonCardContent>
        </IonCard>

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
        
        <IonButton 
          expand="block" 
          disabled={!horaSeleccionada} 
          onClick={() => setShowResumenModal(true)}
        >
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
                  <p>{getCampusNameById(campuses, campusSeleccionado)}</p>
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