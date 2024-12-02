import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonList, IonItem, 
  IonLabel, IonButton, IonIcon, IonModal, IonButtons, IonSelect, 
  IonSelectOption, IonCard, IonCardHeader, IonCardContent, IonCardTitle,
  IonSegment, IonSegmentButton, IonSpinner
} from '@ionic/react';
import { add, create, trash, closeCircle, time } from 'ionicons/icons';
import { Campus, Servicio, Deporte, getCampus, getDeportes } from '../../services/serviciosDeportivosService';
import './ServiciosDeportivosAdmin.css';

interface NuevoServicioState {
  campusId: number;
  deporte: string;
  estado: boolean;
}

const ServiciosDeportivosAdmin: React.FC = () => {
  // Estados principales
  const [campus, setCampus] = useState<Campus[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [activeTab, setActiveTab] = useState('servicios');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deportesDisponibles, setDeportesDisponibles] = useState<Deporte[]>([]);
  const [loadingDeportes, setLoadingDeportes] = useState(false);

  // Estados para modales
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [showHorariosModal, setShowHorariosModal] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  
  // Estado para nuevo servicio
  const [nuevoServicio, setNuevoServicio] = useState<NuevoServicioState>({
    campusId: 0,
    deporte: '',
    estado: true,
  });

  // Estado para horarios
  const [horariosSeleccionados, setHorariosSeleccionados] = useState<string[]>([]);

  // Cargar campus inicialmente
  useEffect(() => {
    const loadCampus = async () => {
      try {
        setLoading(true);
        const data = await getCampus();
        setCampus(data);
      } catch (err) {
        setError('Error al cargar los campus');
        console.error('Error loading campus:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCampus();
  }, []);

  // Cargar deportes cuando se selecciona un campus
  const loadDeportesForCampus = async (campusId: number) => {
    if (campusId > 0) {
      try {
        setLoadingDeportes(true);
        setError(null);
        const deportes = await getDeportes(campusId);
        
        if (deportes && deportes.length > 0) {
          setDeportesDisponibles(deportes);
          console.log('Deportes cargados:', deportes);
        } else {
          setDeportesDisponibles([]);
          console.log('No se encontraron deportes para este campus');
        }
      } catch (err) {
        console.error('Error al cargar deportes:', err);
        setError('Error al cargar los deportes');
        setDeportesDisponibles([]);
      } finally {
        setLoadingDeportes(false);
      }
    } else {
      setDeportesDisponibles([]);
    }
  };

  const handleCampusChange = async (event: CustomEvent) => {
    const campusId = Number(event.detail.value);
    
    if (!isNaN(campusId)) {
      setNuevoServicio(prev => ({
        ...prev,
        campusId,
        deporte: '' // Reset deporte when campus changes
      }));
      
      await loadDeportesForCampus(campusId);
    }
  };

  const handleAgregarServicio = () => {
    if (nuevoServicio.campusId && nuevoServicio.deporte) {
      const newId = servicios.length > 0 
        ? (Math.max(...servicios.map(s => parseInt(s.id))) + 1).toString()
        : '1';
      
      const nuevoServicioCompleto: Servicio = {
        id: newId,
        campusId: nuevoServicio.campusId,
        deporte: nuevoServicio.deporte,
        estado: nuevoServicio.estado,
        horarios: []
      };

      setServicios([...servicios, nuevoServicioCompleto]);
      resetForm();
    }
  };

  const handleEliminarServicio = (id: string) => {
    setServicios(servicios.filter(s => s.id !== id));
  };

  const handleEditarHorarios = (servicio: Servicio) => {
    setServicioSeleccionado(servicio);
    setHorariosSeleccionados(servicio.horarios || []);
    setShowHorariosModal(true);
  };

  const handleAgregarHorario = (horario: string) => {
    if (servicioSeleccionado && !horariosSeleccionados.includes(horario)) {
      const nuevosHorarios = [...horariosSeleccionados, horario];
      setHorariosSeleccionados(nuevosHorarios);
      
      setServicios(servicios.map(s => 
        s.id === servicioSeleccionado.id 
          ? { ...s, horarios: nuevosHorarios }
          : s
      ));
    }
  };

  const handleEliminarHorario = (horario: string) => {
    if (servicioSeleccionado) {
      const nuevosHorarios = horariosSeleccionados.filter(h => h !== horario);
      setHorariosSeleccionados(nuevosHorarios);
      
      setServicios(servicios.map(s => 
        s.id === servicioSeleccionado.id 
          ? { ...s, horarios: nuevosHorarios }
          : s
      ));
    }
  };

  const resetForm = () => {
    setShowServicioModal(false);
    setNuevoServicio({
      campusId: 0,
      deporte: '',
      estado: true,
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Administración de Servicios Deportivos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as string)}>
          <IonSegmentButton value="servicios">
            <IonLabel>Servicios</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="horarios">
            <IonLabel>Horarios</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {activeTab === 'servicios' && (
          <IonCard>
            <IonCardContent>
              <IonButton expand="block" onClick={() => setShowServicioModal(true)}>
                <IonIcon icon={add} slot="start" />
                Agregar Nuevo Servicio
              </IonButton>

              <IonList>
                {servicios.map((servicio) => (
                  <IonItem key={servicio.id}>
                    <IonLabel>
                      <h2>{servicio.deporte}</h2>
                      <p>Campus: {campus.find(c => c.id === servicio.campusId)?.description}</p>
                      <p>Estado: {servicio.estado ? 'Activo' : 'Inactivo'}</p>
                    </IonLabel>
                    <IonButton fill="clear" color="danger" onClick={() => handleEliminarServicio(servicio.id)}>
                      <IonIcon icon={trash} />
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {activeTab === 'horarios' && (
          <IonCard>
            <IonCardContent>
              <IonList>
                {servicios.map((servicio) => (
                  <IonItem key={servicio.id}>
                    <IonLabel>
                      <h2>{servicio.deporte}</h2>
                      <p>Campus: {campus.find(c => c.id === servicio.campusId)?.description}</p>
                      <p>Horarios configurados: {servicio.horarios?.length || 0}</p>
                    </IonLabel>
                    <IonButton fill="clear" onClick={() => handleEditarHorarios(servicio)}>
                      <IonIcon icon={time} />
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* Modal para agregar servicio */}
        <IonModal isOpen={showServicioModal} onDidDismiss={resetForm}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nuevo Servicio Deportivo</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={resetForm}>
                  <IonIcon icon={closeCircle} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Campus</IonLabel>
                <IonSelect 
                  value={nuevoServicio.campusId}
                  onIonChange={handleCampusChange}
                >
                  {campus.map(c => (
                    <IonSelectOption key={c.id} value={c.id}>
                      {c.description}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {nuevoServicio.campusId > 0 && (
                <IonItem>
                  <IonLabel position="stacked">Deporte</IonLabel>
                  {loadingDeportes ? (
                    <IonSpinner />
                  ) : deportesDisponibles.length > 0 ? (
                    <IonSelect
                      value={nuevoServicio.deporte}
                      onIonChange={e => setNuevoServicio(prev => ({ 
                        ...prev, 
                        deporte: e.detail.value 
                      }))}
                    >
                      {deportesDisponibles.map(deporte => (
                        <IonSelectOption key={deporte.id} value={deporte.name}>
                          {deporte.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  ) : (
                    <IonLabel color="medium">
                      No hay deportes disponibles para este campus
                    </IonLabel>
                  )}
                </IonItem>
              )}
            </IonList>

            <IonButton
              expand="block"
              className="ion-margin"
              onClick={handleAgregarServicio}
              disabled={!nuevoServicio.campusId || !nuevoServicio.deporte}
            >
              Agregar Servicio
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Modal para gestionar horarios */}
        <IonModal isOpen={showHorariosModal} onDidDismiss={() => setShowHorariosModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Gestionar Horarios</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowHorariosModal(false)}>
                  <IonIcon icon={closeCircle} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Agregar Horario</IonLabel>
                <IonSelect
                  onIonChange={e => handleAgregarHorario(e.detail.value)}
                  placeholder="Seleccionar horario"
                >
                  {Array.from({ length: 14 }, (_, i) => {
                    const hora = i + 8;
                    const horario = `${hora}:00 - ${hora + 1}:00`;
                    return (
                      <IonSelectOption 
                        key={horario} 
                        value={horario}
                        disabled={horariosSeleccionados.includes(horario)}
                      >
                        {horario}
                      </IonSelectOption>
                    );
                  })}
                </IonSelect>
              </IonItem>

              <IonList>
                {horariosSeleccionados.map((horario, index) => (
                  <IonItem key={index}>
                    <IonLabel>{horario}</IonLabel>
                    <IonButton 
                      fill="clear" 
                      color="danger"
                      onClick={() => handleEliminarHorario(horario)}
                    >
                      <IonIcon icon={trash} slot="icon-only" />
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ServiciosDeportivosAdmin;