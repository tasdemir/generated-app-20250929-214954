import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, FieldEntity, MatchEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, Field, Match, PlayerRegistration } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- USER ROUTES ---
  app.post('/api/register', async (c) => {
    const body = await c.req.json<Omit<User, 'id' | 'role' | 'stats'>>();
    if (!isStr(body.username) || !isStr(body.password) || !isStr(body.phone) || !isStr(body.birthDate) || !isStr(body.favoriteTeam) || !isStr(body.city) || !isStr(body.district)) {
      return bad(c, 'Missing required fields');
    }
    const user = new UserEntity(c.env, body.username);
    if (await user.exists()) {
      return bad(c, 'Username already taken');
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      username: body.username,
      role: 'player',
      phone: body.phone,
      birthDate: body.birthDate,
      favoriteTeam: body.favoriteTeam,
      city: body.city,
      district: body.district,
      stats: { points: 0, matchesPlayed: 0, wins: 0, draws: 0, losses: 0, tags: [] },
      password: body.password,
      // height and weight are removed as per client feedback
    };
    await UserEntity.create(c.env, newUser);
    const { password, ...userClientData } = newUser;
    return ok(c, userClientData);
  });
  app.post('/api/login', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const { username, password } = await c.req.json<{ username?: string, password?: string }>();
    if (!isStr(username) || !isStr(password)) {
      return bad(c, 'Username and password are required');
    }
    const userEntity = new UserEntity(c.env, username);
    if (!await userEntity.exists()) {
      return notFound(c, 'User not found');
    }
    const user = await userEntity.getState();
    if (user.password !== password) {
      return bad(c, 'Invalid credentials');
    }
    const { password: _, ...userClientData } = user;
    return ok(c, userClientData);
  });
  app.get('/api/users', async (c) => {
    const page = await UserEntity.list(c.env);
    const usersWithoutPasswords = page.items.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    return ok(c, { ...page, items: usersWithoutPasswords });
  });
  app.put('/api/users/profile', async (c) => {
    const { id, phone, birthDate, favoriteTeam, height, weight } = await c.req.json<{ id: string, phone: string, birthDate: string, favoriteTeam: string, height?: number, weight?: number }>();
    const allUsers = (await UserEntity.list(c.env)).items;
    const userToUpdate = allUsers.find(u => u.id === id);
    if (!userToUpdate) return notFound(c, 'User not found');
    const userEntity = new UserEntity(c.env, userToUpdate.username);
    await userEntity.patch({ phone, birthDate, favoriteTeam, height, weight });
    const updatedUser = await userEntity.getState();
    const { password, ...userClientData } = updatedUser;
    return ok(c, userClientData);
  });
  app.put('/api/users/:id/promote', async (c) => {
    const userId = c.req.param('id');
    const allUsers = (await UserEntity.list(c.env)).items;
    const userToPromote = allUsers.find(u => u.id === userId);
    if (!userToPromote) {
      return notFound(c, 'User not found');
    }
    const userEntity = new UserEntity(c.env, userToPromote.username);
    await userEntity.patch({ role: 'coach' });
    const updatedUser = await userEntity.getState();
    const { password, ...userClientData } = updatedUser;
    return ok(c, userClientData);
  });
  // --- FIELD ROUTES ---
  app.get('/api/fields', async (c) => {
    const page = await FieldEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/fields', async (c) => {
    const body = await c.req.json<Omit<Field, 'id'>>();
    if (!isStr(body.name) || !isStr(body.city) || !isStr(body.district)) {
      return bad(c, 'Missing required fields');
    }
    const newField: Field = {
      id: crypto.randomUUID(),
      ...body,
    };
    await FieldEntity.create(c.env, newField);
    return ok(c, newField);
  });
  // --- MATCH ROUTES ---
  app.post('/api/matches', async (c) => {
    const body = await c.req.json<Omit<Match, 'id' | 'shortCode' | 'status' | 'registrations' | 'teamA' | 'teamB'>>();
    if (!isStr(body.date) || !isStr(body.time) || !isStr(body.fieldId) || !isStr(body.coachId) || !body.mainTeamSize) {
      return bad(c, 'Missing required fields');
    }
    if (body.fieldId === 'CUSTOM' && !isStr(body.customFieldName)) {
      return bad(c, 'Custom field name is required when fieldId is CUSTOM');
    }
    const generateShortCode = () => {
      const nums = Math.floor(1000 + Math.random() * 9000);
      const chars = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return `${nums}${chars}`;
    };
    const newMatch: Match = {
      id: crypto.randomUUID(),
      shortCode: generateShortCode(),
      status: 'upcoming',
      registrations: [],
      teamA: [],
      teamB: [],
      ...body,
    };
    await MatchEntity.create(c.env, newMatch);
    return ok(c, newMatch);
  });
  const enrichMatch = async (c: { env: Env }, match: Match) => {
    let field: Field | null = null;
    if (match.customFieldName) {
      field = { id: 'CUSTOM', name: match.customFieldName, city: 'Istanbul', district: 'Kadikoy' }; // City/district are placeholders
    } else if (match.fieldId) {
      const fieldEntity = new FieldEntity(c.env, match.fieldId);
      if (await fieldEntity.exists()) {
        field = await fieldEntity.getState();
      }
    }
    const allUsers = (await UserEntity.list(c.env)).items;
    const coach = allUsers.find(u => u.id === match.coachId);
    const { password, ...coachData } = coach || {};
    const registrationsWithUsernames = match.registrations.map(reg => {
      const player = allUsers.find(u => u.id === reg.playerId);
      return { ...reg, username: player?.username || 'Bilinmeyen' };
    });
    return { ...match, field, coach: coachData, registrations: registrationsWithUsernames };
  };
  app.get('/api/matches', async (c) => {
    const page = await MatchEntity.list(c.env);
    const enrichedItems = await Promise.all(page.items.map(match => enrichMatch(c, match)));
    return ok(c, { ...page, items: enrichedItems });
  });
  app.get('/api/matches/search/:shortCode', async (c) => {
    const shortCode = c.req.param('shortCode').toUpperCase();
    const { items: allMatches } = await MatchEntity.list(c.env);
    const match = allMatches.find(m => m.shortCode === shortCode);
    if (!match) {
      return notFound(c, 'Match not found');
    }
    const enriched = await enrichMatch(c, match);
    return ok(c, enriched);
  });
  app.get('/api/matches/:matchId', async (c) => {
    const matchId = c.req.param('matchId');
    const matchEntity = new MatchEntity(c.env, matchId);
    if (!await matchEntity.exists()) {
      return notFound(c, 'Match not found');
    }
    const match = await matchEntity.getState();
    const enriched = await enrichMatch(c, match);
    return ok(c, enriched);
  });
  app.post('/api/matches/:matchId/register', async (c) => {
    const matchId = c.req.param('matchId');
    const { playerId, status } = await c.req.json<{ playerId: string, status: PlayerRegistration['status'] }>();
    if (!isStr(playerId) || !isStr(status)) {
      return bad(c, 'Player ID and status are required');
    }
    const matchEntity = new MatchEntity(c.env, matchId);
    if (!await matchEntity.exists()) {
      return notFound(c, 'Match not found');
    }
    const updatedMatch = await matchEntity.mutate(match => {
      const existingRegistrationIndex = match.registrations.findIndex(r => r.playerId === playerId);
      const newRegistration: PlayerRegistration = {
        playerId,
        status,
        registrationTime: new Date().toISOString(),
      };
      if (existingRegistrationIndex > -1) {
        match.registrations[existingRegistrationIndex] = newRegistration;
      } else {
        match.registrations.push(newRegistration);
      }
      return match;
    });
    return ok(c, updatedMatch);
  });
  app.post('/api/matches/:matchId/assign', async (c) => {
    const matchId = c.req.param('matchId');
    const { playerId, team } = await c.req.json<{ playerId: string, team: 'A' | 'B' | 'none' }>();
    const matchEntity = new MatchEntity(c.env, matchId);
    if (!await matchEntity.exists()) return notFound(c, 'Match not found');
    const updatedMatch = await matchEntity.mutate(match => {
      match.teamA = match.teamA.filter(id => id !== playerId);
      match.teamB = match.teamB.filter(id => id !== playerId);
      if (team === 'A') match.teamA.push(playerId);
      if (team === 'B') match.teamB.push(playerId);
      return match;
    });
    return ok(c, updatedMatch);
  });
  app.post('/api/matches/:matchId/score', async (c) => {
    const matchId = c.req.param('matchId');
    const { result, playerUpdates } = await c.req.json<{ result: Match['result'], playerUpdates: { playerId: string, tags: string[] }[] }>();
    const matchEntity = new MatchEntity(c.env, matchId);
    if (!await matchEntity.exists()) return notFound(c, 'Match not found');
    const match = await matchEntity.getState();
    if (match.status === 'completed') return bad(c, 'Match already scored');
    const allUsers = (await UserEntity.list(c.env)).items;
    const updateUserStats = async (playerId: string, points: number, outcome: 'win' | 'draw' | 'loss', tags: string[]) => {
      const user = allUsers.find(u => u.id === playerId);
      if (!user) return;
      const userEntity = new UserEntity(c.env, user.username);
      await userEntity.mutate(u => {
        u.stats.points += points;
        u.stats.matchesPlayed += 1;
        if (outcome === 'win') u.stats.wins += 1;
        if (outcome === 'draw') u.stats.draws += 1;
        if (outcome === 'loss') u.stats.losses += 1;
        u.stats.tags = [...new Set([...u.stats.tags, ...tags])];
        return u;
      });
    };
    if (result === 'Team A Win') {
      for (const pId of match.teamA) await updateUserStats(pId, 3, 'win', playerUpdates.find(p => p.playerId === pId)?.tags || []);
      for (const pId of match.teamB) await updateUserStats(pId, 1, 'loss', playerUpdates.find(p => p.playerId === pId)?.tags || []);
    } else if (result === 'Team B Win') {
      for (const pId of match.teamB) await updateUserStats(pId, 3, 'win', playerUpdates.find(p => p.playerId === pId)?.tags || []);
      for (const pId of match.teamA) await updateUserStats(pId, 1, 'loss', playerUpdates.find(p => p.playerId === pId)?.tags || []);
    } else if (result === 'Draw') {
      for (const pId of [...match.teamA, ...match.teamB]) await updateUserStats(pId, 2, 'draw', playerUpdates.find(p => p.playerId === pId)?.tags || []);
    }
    await matchEntity.patch({ status: 'completed', result });
    return ok(c, { message: 'Match scored successfully' });
  });
}