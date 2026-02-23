// packages/shared/src/requests.ts

// Lo que envías para registrar un usuario nuevo
export interface RegisterUserRequest {
  email: string;
  passwordRaw: string; // Aquí sí envías el password en texto plano para que el back lo hashee
  name: string;
  lastName: string;
  role: 'PLAYER' | 'OWNER'; // Para saber qué perfil crearle en la DB
}

// Lo que envías al confirmar una reserva en la cancha
export interface CreateReservationRequest {
  courtId: number;
  startTime: string; // "2026-02-23T18:00:00.000Z"
  endTime: string;
  // El backend debería deducir el userId desde el token JWT
  // y calcular el finalPrice basado en la hora (day_price vs night_price)
}

// Lo que envía el dueño para crear una nueva cancha
export interface CreateCourtRequest {
  clubId: number;
  name: string;
  amenities: string;
  dayPrice: number;
  nightPrice: number;
}