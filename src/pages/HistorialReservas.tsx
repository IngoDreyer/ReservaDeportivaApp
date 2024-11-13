import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonSpinner,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonCol,
  IonGrid,
  IonSearchbar,
  IonToast,
  IonItem,
  IonLabel
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';
import { getReservasByRun, HistorialReserva } from '../services/historialService';
import './HistorialReservas.css';

const HistorialReservas: React.FC = () => {
  // Estados
  const [reservas, setReservas] = useState<HistorialReserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<HistorialReserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<string>('18572091');
  const [searchText, setSearchText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const RUNS = ['18572091', '19247979']; // Agrega aquí los RUTs necesarios

  // Cargar datos cuando cambia el RUN
  useEffect(() => {
    const loadReservas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getReservasByRun(selectedRun);
        setReservas(data);
        setFilteredReservas(data);
      } catch (err) {
        setError('Error al cargar las reservas');
        setToastMessage('Error al cargar las reservas. Por favor intente nuevamente.');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRun) {
      loadReservas();
    }
  }, [selectedRun]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar reservas
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredReservas(reservas);
      return;
    }

    const filtered = reservas.filter(reserva =>
      reserva.headquarter.toLowerCase().includes(searchText.toLowerCase()) ||
      reserva.sport.toLowerCase().includes(searchText.toLowerCase()) ||
      reserva.day.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredReservas(filtered);
  }, [searchText, reservas]);

  // Handler para Pull to Refresh
  const handleRefresh = async (event: CustomEvent) => {
    try {
      const data = await getReservasByRun(selectedRun);
      setReservas(data);
      setFilteredReservas(data);
      setError(null);
      setToastMessage('Datos actualizados correctamente');
      setShowToast(true);
    } catch (err) {
      setError('Error al actualizar las reservas');
      setToastMessage('Error al actualizar. Por favor intente nuevamente.');
      setShowToast(true);
    } finally {
      event.detail.complete();
    }
  };

  const getSortedReservas = () => {
    return [...filteredReservas].sort((a, b) => {
      // Primero ordenar por estado (activas primero)
      if (a.state !== b.state) {
        return b.state ? 1 : -1;
      }
      // Luego por fecha
      return new Date(b.register_date).getTime() - new Date(a.register_date).getTime();
    });
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

        <IonCard>
          <IonCardContent>
            <div className="filters-container">
              <IonItem className="run-select-item">
                <IonLabel>RUT</IonLabel>
                <IonSelect
                  value={selectedRun}
                  onIonChange={e => setSelectedRun(e.detail.value)}
                  interface="action-sheet"
                  interfaceOptions={{
                    header: 'Seleccionar RUT'
                  }}
                >
                  {RUNS.map(run => (
                    <IonSelectOption key={run} value={run}>
                      {run}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonSearchbar
                value={searchText}
                onIonChange={e => setSearchText(e.detail.value || '')}
                placeholder="Buscar por campus, deporte o día"
                className="custom-searchbar"
              />
            </div>
          </IonCardContent>
        </IonCard>

        {loading ? (
          <div className="loading-container">
            <IonSpinner />
            <p>Cargando reservas...</p>
          </div>
        ) : error ? (
          <IonCard>
            <IonCardContent className="error-container">
              <p>{error}</p>
              <IonButton onClick={() => setSelectedRun(selectedRun)}>
                <IonIcon icon={refreshOutline} slot="start" />
                Reintentar
              </IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
            <IonCard>
            <IonCardHeader>
              <IonCardTitle className="card-title">
                RUT: {selectedRun}
                <span className="total-count">
                  Total: {filteredReservas.length}
                </span>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="table-container">
                <table className="reservas-table">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Campus</th>
                      <th>Deporte</th>
                      <th>Día</th>
                      <th>Hora</th>
                      <th>Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedReservas().map((reserva, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                        <td>
                          <IonBadge color={reserva.state ? 'success' : 'medium'}>
                            {reserva.state ? 'Activa' : 'Inactiva'}
                          </IonBadge>
                        </td>
                        <td className="campus-col" title={reserva.headquarter}>
                          {reserva.headquarter}
                        </td>
                        <td className="sport-col" title={reserva.sport}>
                          {reserva.sport}
                        </td>
                        <td>{reserva.day}</td>
                        <td>{reserva.start}</td>
                        <td>{formatDate(reserva.register_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredReservas.length === 0 && (
                  <div className="no-results">
                    <p>No se encontraron reservas</p>
                  </div>
                )}
              </div>
            </IonCardContent>
          </IonCard>
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