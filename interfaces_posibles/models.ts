// packages/shared/src/models.ts
import { ReservationStatus } from './enums';

export interface User {
  id: number;
  email: string;
  name: string;
  lastName: string;
}

export interface PlayerProfile {
  id: number;
  userId: number;
  name: string;
  lastName: string;
}

export interface OwnerProfile {
  id: number;
  userId: number;
  name: string;
  lastName: string;
}

export interface Club {
  id: number;
  name: string;
  address: string;
  description: string;
  amenities: string; 
  value: string;
  openingHour: string; // Ej: "08:00"
  closingHour: string; // Ej: "23:00"
}

export interface Court {
  id: number;
  clubId: number;
  name: string;
  amenities: string;
  dayPrice: number;
  nightPrice: number;
}

export interface Reservation {
  id: number;
  courtId: number;
  userId: number;
  finalPrice: number;
  startTime: string; // ISO string (Date en JSON viaja como string)
  endTime: string;   // ISO string
  status: ReservationStatus;
}