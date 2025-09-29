// This file is for shared types between frontend and backend.
export type Role = 'admin' | 'coach' | 'player';
export interface User {
  id: string;
  username: string;
  role: Role;
  phone: string;
  birthDate: string; // ISO 8601 format
  favoriteTeam: string;
  city: 'Istanbul' | 'Ankara';
  district: 'Besiktas' | 'Kadikoy' | 'Ulus' | 'Cankaya';
  stats: PlayerStats;
  password?: string; // Only for backend use
  height?: number;
  weight?: number;
}
export interface PlayerStats {
  points: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  tags: string[]; // e.g., ['en çok koşan', 'en çok gol kurtaran']
}
export interface Field {
  id: string;
  name: string;
  city: 'Istanbul' | 'Ankara';
  district: 'Besiktas' | 'Kadikoy' | 'Ulus' | 'Cankaya';
}
export interface Match {
  id: string;
  shortCode: string; // e.g., '1234AB'
  date: string; // e.g., "25 Aral��k"
  time: string; // e.g., "21:00"
  fieldId: string;
  coachId: string;
  mainTeamSize: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  registrations: PlayerRegistration[];
  teamA: string[]; // User IDs
  teamB: string[]; // User IDs
  result?: 'Team A Win' | 'Team B Win' | 'Draw';
  customFieldName?: string;
}
export interface PlayerRegistration {
  playerId: string;
  status: 'Mutlaka geleceğim' | 'Belki gelirim' | 'Gelemem';
  registrationTime: string; // ISO 8601 format
}
export type ApiResponse<T = unknown> = ({ success: true; data: T; }) | ({ success: false; error: string; });