import { getReadSource } from '@/services/dbConfig';
import { initDatabase, writeDoc, deleteDoc as localDeleteDoc, readDocs as localReadDocs, readDoc as localReadDoc } from '@/services/localDb';
import * as firestore from '@/services/firestoreService';
import type { Unit, Notice, User, Top5Entry, FollowUp, Appointment, Role } from '@/types';

async function syncWrite(collection: string, id: string | undefined, data: Record<string, unknown>): Promise<void> {
  try {
    await initDatabase();
    if (id) {
      await writeDoc(collection, id, data);
    }
  } catch {
    // Local DB write is best-effort backup
  }
}

async function syncDelete(collection: string, id: string): Promise<void> {
  try {
    await initDatabase();
    await localDeleteDoc(collection, id);
  } catch {
    // best-effort
  }
}

function preferLocal(): boolean {
  return getReadSource() === 'local';
}

// Units
export async function fetchUnits(): Promise<Unit[]> {
  if (preferLocal()) {
    await initDatabase();
    return localReadDocs<Unit>('units');
  }
  const data = await firestore.fetchUnits();
  data.forEach((u) => syncWrite('units', u.id, u as unknown as Record<string, unknown>));
  try {
    const history = await firestore.fetchRawTCEHistory();
    const byUnit: Record<string, { date: string; total: number }[]> = {};
    for (const h of history) {
      if (!byUnit[h.razaoSocial]) byUnit[h.razaoSocial] = [];
      byUnit[h.razaoSocial].push({ date: h.date, total: h.totalTCE });
    }
    for (const unit of data) {
      const unitHistory = byUnit[unit.nomeFantasia] || byUnit[unit.razaoSocial];
      if (unitHistory && unitHistory.length > 0) {
        unitHistory.sort((a, b) => a.date.localeCompare(b.date));
        const latest = unitHistory[unitHistory.length - 1];
        const currentMonth = latest.date.slice(0, 7);
        const prevEntries = unitHistory.filter(h => h.date < currentMonth + '-01');
        const lastPrevEntry = prevEntries.length > 0 ? prevEntries[prevEntries.length - 1] : null;
        const baseline = lastPrevEntry?.total ?? 0;
        unit.growth = latest.total - baseline;
        unit.tces = latest.total;
      }
    }
    const withTces = data.map(u => ({ id: u.id, tces: u.tces ?? 0 }));
    withTces.sort((a, b) => {
      if (a.tces > b.tces) return -1;
      if (a.tces < b.tces) return 1;
      return 0;
    });
    withTces.forEach((u, i) => {
      const found = data.find(d => d.id === u.id);
      if (found) found.ranking = i + 1;
    });
  } catch {}
  return data;
}

export async function fetchUnit(id: string): Promise<Unit | null> {
  if (preferLocal()) {
    await initDatabase();
    return localReadDoc<Unit>('units', id);
  }
  const data = await firestore.fetchUnit(id);
  if (data) {
    syncWrite('units', id, data as unknown as Record<string, unknown>);
    try {
      const history = await firestore.fetchRawTCEHistory();
      const unitHistory = history.filter(h => h.razaoSocial === data.nomeFantasia || h.razaoSocial === data.razaoSocial);
      if (unitHistory.length > 0) {
        unitHistory.sort((a, b) => a.date.localeCompare(b.date));
        const latest = unitHistory[unitHistory.length - 1];
        const currentMonth = latest.date.slice(0, 7);
        const prevEntries = unitHistory.filter(h => h.date < currentMonth + '-01');
        const lastPrevEntry = prevEntries.length > 0 ? prevEntries[prevEntries.length - 1] : null;
        data.growth = latest.totalTCE - (lastPrevEntry?.totalTCE ?? 0);
        data.tces = latest.totalTCE;
      }
      const latestPerUnit: Record<string, { tces: number; date: string }> = {};
      for (const h of history) {
        const existing = latestPerUnit[h.razaoSocial];
        if (!existing || h.date > existing.date) {
          latestPerUnit[h.razaoSocial] = { tces: h.totalTCE, date: h.date };
        }
      }
      const tcesSorted = Object.entries(latestPerUnit).sort(([, a], [, b]) => b.tces - a.tces);
      const rank = tcesSorted.findIndex(([name]) => name === data.nomeFantasia || name === data.razaoSocial) + 1;
      if (rank > 0) data.ranking = rank;
    } catch {}
  }
  return data;
}

export async function updateUnit(id: string, data: Partial<Unit>): Promise<void> {
  await firestore.updateUnit(id, data);
  await syncWrite('units', id, data as unknown as Record<string, unknown>);
}

// Notices
export async function fetchNotices(): Promise<Notice[]> {
  if (preferLocal()) {
    await initDatabase();
    return localReadDocs<Notice>('notices');
  }
  const data = await firestore.fetchNotices();
  data.forEach((n) => syncWrite('notices', n.id, n as unknown as Record<string, unknown>));
  return data;
}

export async function createNotice(data: Omit<Notice, 'id' | 'createdAt'>): Promise<string> {
  const id = await firestore.createNotice(data);
  await syncWrite('notices', id, { ...data, id } as unknown as Record<string, unknown>);
  return id;
}

export async function updateNotice(id: string, data: Partial<Notice>): Promise<void> {
  await firestore.updateNotice(id, data);
  await syncWrite('notices', id, data as unknown as Record<string, unknown>);
}

export async function deleteNotice(id: string): Promise<void> {
  await firestore.deleteNotice(id);
  await syncDelete('notices', id);
}

// Users
export async function fetchUsers(): Promise<User[]> {
  if (preferLocal()) {
    await initDatabase();
    return localReadDocs<User>('users');
  }
  const data = await firestore.fetchUsers();
  data.forEach((u) => syncWrite('users', u.id, u as unknown as Record<string, unknown>));
  return data;
}

export async function fetchPendingUsers(): Promise<User[]> {
  if (preferLocal()) {
    await initDatabase();
    const all = await localReadDocs<User>('users');
    return all.filter((u) => !u.approved);
  }
  const data = await firestore.fetchPendingUsers();
  data.forEach((u) => syncWrite('users', u.id, u as unknown as Record<string, unknown>));
  return data;
}

export async function approveUser(id: string, data: { role: Role; unitId?: string }): Promise<void> {
  await firestore.approveUser(id, data);
  await syncWrite('users', id, { ...data, approved: true } as unknown as Record<string, unknown>);
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await firestore.updateUser(id, data);
  await syncWrite('users', id, data as unknown as Record<string, unknown>);
}

// Top5
export async function fetchTop5(): Promise<Top5Entry[]> {
  if (preferLocal()) {
    await initDatabase();
    return localReadDocs<Top5Entry>('top5_audit');
  }
  const data = await firestore.fetchTop5();
  data.forEach((t) => syncWrite('top5_audit', (t as any).id, t as unknown as Record<string, unknown>));
  return data;
}

export async function updateTop5Entry(id: string, data: Partial<Top5Entry>): Promise<void> {
  await firestore.updateTop5Entry(id, data);
  await syncWrite('top5_audit', id, data as unknown as Record<string, unknown>);
}

export async function deleteTop5Entry(id: string): Promise<void> {
  await firestore.deleteTop5Entry(id);
  await syncDelete('top5_audit', id);
}

// Follow Up
export async function fetchFollowUps(): Promise<FollowUp[]> {
  if (preferLocal()) {
    await initDatabase();
    return localReadDocs<FollowUp>('follow_up');
  }
  const data = await firestore.fetchFollowUps();
  data.forEach((f) => syncWrite('follow_up', f.id, f as unknown as Record<string, unknown>));
  return data;
}

export async function createFollowUp(data: Omit<FollowUp, 'id'>): Promise<string> {
  const id = await firestore.createFollowUp(data);
  await syncWrite('follow_up', id, { ...data, id } as unknown as Record<string, unknown>);
  return id;
}

// Appointments
export async function fetchAppointments(): Promise<Appointment[]> {
  if (preferLocal()) {
    await initDatabase();
    return localReadDocs<Appointment>('appointments');
  }
  const data = await firestore.fetchAppointments();
  data.forEach((a) => syncWrite('appointments', a.id, a as unknown as Record<string, unknown>));
  return data;
}

export async function createAppointment(data: Omit<Appointment, 'id'>): Promise<string> {
  const id = await firestore.createAppointment(data);
  await syncWrite('appointments', id, { ...data, id } as unknown as Record<string, unknown>);
  return id;
}

export async function deleteAppointment(id: string): Promise<void> {
  await firestore.deleteAppointment(id);
  await syncDelete('appointments', id);
}

// TCE History
export async function fetchTCEHistory(unitId?: string): Promise<{ date: string; totalTCE: number }[]> {
  if (preferLocal()) {
    await initDatabase();
    const all = await localReadDocs<{ date: string; totalTCE: number }>('tce_history');
    return unitId ? all.filter((h) => (h as any).unitId === unitId) : all;
  }
  const data = await firestore.fetchTCEHistory(unitId);
  data.forEach((h) => syncWrite('tce_history', `${h.date}-${unitId ?? 'all'}`, h as unknown as Record<string, unknown>));
  return data;
}

export async function saveTCEImport(batch: { date: string; rows: { razaoSocial: string }[]; summary: Record<string, number> }): Promise<{ id: string; comparison: { razaoSocial: string; yesterday: number; today: number; diff: number }[] }> {
  const result = await firestore.saveTCEImport(batch);
  for (const [razao, total] of Object.entries(batch.summary)) {
    await syncWrite('tce_history', `${batch.date}-${razao}`, { date: batch.date, razaoSocial: razao, totalTCE: total });
  }
  return result;
}

// Training Presence
export async function fetchTrainingPresence(unitId?: string): Promise<{ trainingDate: string; present: boolean }[]> {
  if (preferLocal()) {
    await initDatabase();
    const all = await localReadDocs<{ trainingDate: string; present: boolean }>('training_presence');
    return unitId ? all.filter((t) => (t as any).unitId === unitId) : all;
  }
  const data = await firestore.fetchTrainingPresence(unitId);
  data.forEach((t) => syncWrite('training_presence', `${t.trainingDate}-${unitId ?? 'all'}`, t as unknown as Record<string, unknown>));
  return data;
}

export async function saveTrainingPresence(batch: { rows: { unitName: string; dates: { date: string; present: boolean }[] }[]; dates: string[] }): Promise<string> {
  const id = await firestore.saveTrainingPresence(batch);
  for (const row of batch.rows) {
    for (const d of row.dates) {
      await syncWrite('training_presence', `${d.date}-${row.unitName}`, { trainingDate: d.date, unitName: row.unitName, present: d.present });
    }
  }
  return id;
}

// Units — create
export async function createUnit(data: Omit<Unit, 'id'>): Promise<string> {
  const id = await firestore.createUnit(data);
  await syncWrite('units', id, { ...data, id } as unknown as Record<string, unknown>);
  return id;
}

export async function createUnitsBulk(data: Omit<Unit, 'id'>[]): Promise<number> {
  let count = 0;
  for (const item of data) {
    await createUnit(item);
    count++;
  }
  return count;
}
