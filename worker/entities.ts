import { IndexedEntity } from "./core-utils";
import type { User, Field, Match, PlayerStats } from "@shared/types";
// --- USER ENTITY ---
const initialPlayerStats: PlayerStats = {
  points: 0,
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  tags: [],
};
const SEED_ADMIN: User = {
  id: 'tasdemir',
  username: 'tasdemir',
  password: 'deneme.123', // In a real app, this would be hashed
  role: 'admin',
  phone: '555-000-0001',
  birthDate: '1980-01-01T00:00:00.000Z',
  favoriteTeam: 'Cloudflare FC',
  city: 'Ankara',
  district: 'Cankaya',
  stats: { ...initialPlayerStats, points: 99, tags: ['System Admin'] },
  height: 180,
  weight: 80,
};
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    username: "",
    password: "",
    role: 'player',
    phone: "",
    birthDate: "",
    favoriteTeam: "",
    city: 'Istanbul',
    district: 'Kadikoy',
    stats: initialPlayerStats,
    height: undefined,
    weight: undefined,
  };
  static seedData = [SEED_ADMIN];
  static override keyOf(state: Partial<User>): string {
    return state.username!;
  }
}
// --- FIELD ENTITY ---
export class FieldEntity extends IndexedEntity<Field> {
  static readonly entityName = "field";
  static readonly indexName = "fields";
  static readonly initialState: Field = {
    id: "",
    name: "",
    city: 'Istanbul',
    district: 'Kadikoy',
  };
}
// --- MATCH ENTITY ---
export class MatchEntity extends IndexedEntity<Match> {
  static readonly entityName = "match";
  static readonly indexName = "matches";
  static readonly initialState: Match = {
    id: "",
    shortCode: "",
    date: "",
    time: "",
    fieldId: "",
    coachId: "",
    mainTeamSize: 0,
    status: 'upcoming',
    registrations: [],
    teamA: [],
    teamB: [],
    result: undefined,
    customFieldName: undefined,
  };
}