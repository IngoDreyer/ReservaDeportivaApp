import React, { useState } from 'react';
import { 
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonList, IonItem, 
  IonLabel, IonButton, IonIcon, IonModal, IonButtons, IonInput, IonSelect, 
  IonSelectOption, IonCard, IonCardHeader, IonCardContent, IonCardTitle 
} from '@ionic/react';
import { add, create, trash, closeCircle } from 'ionicons/icons';
import './ServiciosDeportivosAdmin.css';

interface Servicio {
  id: string;
  nombre: string;
  campus: string;
  estado: boolean;
  capacidad: number;
}

const ServiciosDeportivosAdmin: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([
    { id: '1', nombre: 'Tenis', campus: 'Talca', estado: true, capacidad: 4 },
    { id: '2', nombre: 'Fútbol', campus: 'Talca', estado: true, capacidad: 22 },
    { id: '3', nombre: 'Gimnasio', campus: 'Talca', estado: true, capacidad: 30 },
    { id: '4', nombre: 'Gimnasio', campus: 'Santiago', estado: true, capacidad: 25 },
    { id: '5', nombre: 'Gimnasio', campus: 'Curicó', estado: true, capacidad: 20 }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [nuevoServicio, setNuevoServicio] = useState<Partial<Servicio>>({
    nombre: '',
    campus: '',
    estado: true,
    capacidad: 0
  });

  const handleAgregarEditar = () => {
    if (editando) {
      setServicios(servicios.map(s => s.id === editando.id ? { ...nuevoServicio, id: editando.id } as Servicio : s));
    } else {
      const newId = (Math.max(...servicios.map(s => parseInt(s.id))) + 1).toString();
      setServicios([...servicios, { ...nuevoServicio, id: newId } as Servicio]);
    }
    resetForm();
  };

  const handleEliminar = (id: string) => {
    setServicios(servicios.filter(s => s.id !== id));
  };

  const handleEditar = (servicio: Servicio) => {
    setEditando(servicio);
    setNuevoServicio(servicio);
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditando(null);
    setNuevoServicio({
      nombre: '',
      campus: '',
      estado: true,
      capacidad: 0
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
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Servicios Disponibles</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton 
              expand="block"
              onClick={() => setShowModal(true)}
              color="primary"
            >
              <IonIcon icon={add} slot="start" />
              Agregar Nuevo Servicio
            </IonButton>

            <IonList>
              {servicios.map((servicio) => (
                <IonItem key={servicio.id}>
                  <IonLabel>
                    <h2>{servicio.nombre}</h2>
                    <p>Campus: {servicio.campus}</p>
                    <p>Capacidad: {servicio.capacidad} personas</p>
                    <p>Estado: {servicio.estado ? 'Activo' : 'Inactivo'}</p>
                  </IonLabel>
                  <IonButton 
                    fill="clear"
                    onClick={() => handleEditar(servicio)}
                  >
                    <IonIcon icon={create} slot="icon-only" />
                  </IonButton>
                  <IonButton 
                    fill="clear"
                    color="danger"
                    onClick={() => handleEliminar(servicio.id)}
                  >
                    <IonIcon icon={trash} slot="icon-only" />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonModal isOpen={showModal} onDidDismiss={resetForm}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editando ? 'Editar Servicio' : 'Nuevo Servicio'}</IonTitle>
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
                <IonLabel position="stacked">Nombre del Servicio</IonLabel>
                <IonSelect
                  value={nuevoServicio.nombre}
                  onIonChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.detail.value })}
                >
                  <IonSelectOption value="Tenis">Tenis</IonSelectOption>
                  <IonSelectOption value="Fútbol">Fútbol</IonSelectOption>
                  <IonSelectOption value="Gimnasio">Gimnasio</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Campus</IonLabel>
                <IonSelect
                  value={nuevoServicio.campus}
                  onIonChange={e => setNuevoServicio({ ...nuevoServicio, campus: e.detail.value })}
                >
                  <IonSelectOption value="Talca">Talca</IonSelectOption>
                  <IonSelectOption value="Santiago">Santiago</IonSelectOption>
                  <IonSelectOption value="Curicó">Curicó</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Capacidad</IonLabel>
                <IonInput
                  type="number"
                  value={nuevoServicio.capacidad}
                  onIonChange={e => setNuevoServicio({ ...nuevoServicio, capacidad: parseInt(e.detail.value!) || 0 })}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Estado</IonLabel>
                <IonSelect
                  value={nuevoServicio.estado}
                  onIonChange={e => setNuevoServicio({ ...nuevoServicio, estado: e.detail.value })}
                >
                  <IonSelectOption value={true}>Activo</IonSelectOption>
                  <IonSelectOption value={false}>Inactivo</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonList>

            <IonButton 
              expand="block"
              onClick={handleAgregarEditar}
              className="ion-margin"
            >
              {editando ? 'Guardar Cambios' : 'Agregar Servicio'}
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ServiciosDeportivosAdmin;