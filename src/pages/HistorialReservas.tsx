import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonBadge,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  calendarOutline, 
  timeOutline, 
  locationOutline,
  footballOutline 
} from 'ionicons/icons';
import { getReservasByRun, HistorialReserva } from '../services/historialService';
import './HistorialReservas.css';

const HistorialReservas: React.FC = () => {
  const [reservas, setReservas] = useState<HistorialReserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const RUN = '19247979';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReservasByRun(RUN);
      const sortedData = data.sort((a, b) => {
        if (a.state !== b.state) return b.state ? 1 : -1;
        return new Date(b.register_date).getTime() - new Date(a.register_date).getTime();
      });
      setReservas(sortedData);
    } catch (err) {
      setError('Error al cargar las reservas');
      setToastMessage('Error al cargar las reservas. Por favor intente nuevamente.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadReservas();
      setToastMessage('Datos actualizados correctamente');
      setShowToast(true);
    } catch (err) {
      setToastMessage('Error al actualizar. Por favor intente nuevamente.');
      setShowToast(true);
    } finally {
      event.detail.complete();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Historial de Reservas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="loading-container">
            <IonSpinner />
            <p>Cargando reservas...</p>
          </div>
        ) : error ? (
          <div className="error-container ion-padding">
            <p>{error}</p>
          </div>
        ) : (
          <IonAccordionGroup>
            {reservas.map((reserva, index) => (
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
                            <h2>Campus</h2>
                            <p>{reserva.headquarter}</p>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol size="6">
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
                    
                    <IonRow>
                      <IonCol size="12">
                        <IonItem lines="none">
                          <IonLabel>
                            <h2>Estado</h2>
                            <IonBadge color={reserva.state ? 'success' : 'medium'}>
                              {reserva.state ? 'Activa' : 'Inactiva'}
                            </IonBadge>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        )}

        {reservas.length === 0 && !loading && !error && (
          <div className="ion-padding ion-text-center">
            <p>No se encontraron reservas</p>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
          color={error ? 'danger' : 'success'}
        />
      </IonContent>
    </IonPage>
  );
};

export default HistorialReservas;