import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import PaginaReserva from './pages/PaginaReserva';
import HistorialReservas from './pages/HistorialReservas';
import ServiciosDeportivosAdmin from './components/Admin/ServiciosDeportivosAdmin';


/* Theme variables */

import './theme/variables.scss'
import './global.scss';

/* Custom styles */
import './theme/estilos.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/reserva">
          <PaginaReserva />
        </Route>
        <Route path="/admin/servicios" component={ServiciosDeportivosAdmin} exact />
        <Route exact path="/">
          <Redirect to="/reserva" />
        </Route>
        <IonRouterOutlet>
          <Route path="/historial" component={HistorialReservas} exact />
        </IonRouterOutlet>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;