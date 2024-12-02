export function obtenerHorarios(servicio: string, fecha: Date): string[] {
    const diaSemana = fecha.getDay();
  
    const horariosDisponiblesTenis = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00'
    ];

    const horariosDisponiblesFutbol = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00'
    ];

    const horariosDisponiblesGimnasio = [
        '08:30', '09:40', '10:50', '12:00', '13:10', '14:20', '15:30', '16:40',
        '17:50'
    ];

    const horariosDisponibles = [
        'No existe Hora'
    ];
  
    switch(servicio) {
      case 'Tenis':
        return horariosDisponiblesTenis;
      case 'Futbol':
        return horariosDisponiblesFutbol;
      case 'Gimnasio':
        return horariosDisponiblesGimnasio;
      default:
        return horariosDisponibles;
    }
  }