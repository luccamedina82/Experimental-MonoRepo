// packages/shared/src/responses.ts
import { Reservation, Court, Club, User } from './models';

// Respuesta al ver el detalle de una reserva
export interface ReservationDetailResponse extends Omit<Reservation, 'courtId' | 'userId'> {
  court: Court;
  club: Club; // El club al que pertenece la cancha
  user: User; // Quién reservó
}

// Respuesta al cargar la grilla de turnos de un club
export interface ClubCourtsResponse extends Club {
  courts: Court[];
}

// Interfaz genérica para estandarizar el éxito/error
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}