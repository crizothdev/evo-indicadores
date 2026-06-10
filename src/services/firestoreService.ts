import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, setDoc, query, where, orderBy, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Unit, Notice, User, Top5Entry, FollowUp, Appointment, Role } from '@/types';

function calcStatus(diff: number): string {
  if (diff >= 10) return 'Destaque';
  if (diff >= 0) return 'Operacional';
  if (diff > -5) return 'Queda';
  if (diff > -10) return 'Atenção';
  return 'Crítico';
}

// Units
export async function fetchUnits(): Promise<Unit[]> {
  const snap = await getDocs(collection(db, 'units'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Unit));
}

export async function fetchUnit(id: string): Promise<Unit | null> {
  const snap = await getDoc(doc(db, 'units', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Unit) : null;
}

export async function updateUnit(id: string, data: Partial<Unit>): Promise<void> {
  await updateDoc(doc(db, 'units', id), { ...data, updatedAt: serverTimestamp() });
}

// Notices
export async function fetchNotices(): Promise<Notice[]> {
  const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
}

export async function createNotice(data: Omit<Notice, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'notices'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateNotice(id: string, data: Partial<Notice>): Promise<void> {
  await updateDoc(doc(db, 'notices', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteNotice(id: string): Promise<void> {
  await deleteDoc(doc(db, 'notices', id));
}

// Users
export async function fetchUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
}

export async function fetchPendingUsers(): Promise<User[]> {
  const q = query(collection(db, 'users'), where('approved', '==', false));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
}

export async function createUserDoc(uid: string, data: { name: string; email: string }): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    name: data.name,
    email: data.email,
    role: 'franchise' as Role,
    active: true,
    approved: false,
    createdAt: serverTimestamp(),
  });
}

export async function approveUser(id: string, data: { role: Role; unitId?: string }): Promise<void> {
  await updateDoc(doc(db, 'users', id), {
    ...data,
    approved: true,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', id), { ...data, updatedAt: serverTimestamp() });
}

// Top5
export async function fetchTop5(): Promise<Top5Entry[]> {
  const snap = await getDocs(collection(db, 'top5_audit'));
  return snap.docs.map(d => ({ ...d.data() } as Top5Entry));
}

export async function updateTop5Entry(id: string, data: Partial<Top5Entry>): Promise<void> {
  await updateDoc(doc(db, 'top5_audit', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteTop5Entry(id: string): Promise<void> {
  await deleteDoc(doc(db, 'top5_audit', id));
}

// Follow Up
export async function fetchFollowUps(): Promise<FollowUp[]> {
  const snap = await getDocs(collection(db, 'follow_up'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FollowUp));
}

export async function createFollowUp(data: Omit<FollowUp, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'follow_up'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

// Appointments
export async function fetchAppointments(): Promise<Appointment[]> {
  const q = query(collection(db, 'appointments'), orderBy('date'), orderBy('time'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
}

export async function createAppointment(data: Omit<Appointment, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'appointments'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'appointments', id));
}

// TCE History (for charts)
export async function fetchTCEHistory(unitId?: string): Promise<{ date: string; totalTCE: number }[]> {
  let q = query(collection(db, 'tce_history'), orderBy('date'));
  if (unitId) q = query(q, where('unitId', '==', unitId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ date: d.data().date, totalTCE: d.data().totalTCE }));
}

export async function saveTCEImport(batch: { date: string; rows: { razaoSocial: string }[]; summary: Record<string, number> }): Promise<{ id: string; comparison: { razaoSocial: string; yesterday: number; today: number; diff: number }[] }> {
  const isoDate = batch.date.split('/').reverse().join('-');

  const [y, m] = isoDate.split('-').map(Number);
  const lastPrevMonth = new Date(y, m - 1, 0);
  const prevMonthDate = lastPrevMonth.toISOString().slice(0, 10);

  let baselineDate = '';
  if (prevMonthDate < isoDate) {
    const snap = await getDocs(query(collection(db, 'tce_history'), where('date', '==', prevMonthDate), limit(1)));
    if (!snap.empty) {
      baselineDate = prevMonthDate;
    }
  }
  if (!baselineDate) {
    const dateBeforeMonth = new Date(y, m - 2, 0).toISOString().slice(0, 10);
    const snap = await getDocs(query(collection(db, 'tce_history'), orderBy('date', 'desc'), limit(1)));
    if (!snap.empty) {
      const lastDate = snap.docs[0].data().date as string;
      if (lastDate < isoDate) baselineDate = lastDate;
    }
  }

  const baselineData: Record<string, number> = {};
  if (baselineDate) {
    const baselineSnap = await getDocs(query(collection(db, 'tce_history'), where('date', '==', baselineDate)));
    baselineSnap.docs.forEach(doc => {
      baselineData[doc.data().razaoSocial] = doc.data().totalTCE;
    });
  }

  const ref = await addDoc(collection(db, 'tce_imports'), { ...batch, createdAt: serverTimestamp() });
  for (const [razao, total] of Object.entries(batch.summary)) {
    const existing = await getDocs(query(collection(db, 'tce_history'), where('date', '==', isoDate), where('razaoSocial', '==', razao)));
    if (!existing.empty) {
      for (const d of existing.docs) await deleteDoc(doc(db, 'tce_history', d.id));
    }
    await addDoc(collection(db, 'tce_history'), { date: isoDate, razaoSocial: razao, totalTCE: total, createdAt: serverTimestamp() });
    const unitSnap = await getDocs(query(collection(db, 'units'), where('nomeFantasia', '==', razao)));
    if (!unitSnap.empty) {
      const baseline = baselineData[razao] ?? 0;
      const diff = total - baseline;
      const status = calcStatus(diff);
      await updateDoc(doc(db, 'units', unitSnap.docs[0].id), { tces: total, growth: diff, status });
    }
  }

  const allUnits = await getDocs(collection(db, 'units'));
  const ranked = allUnits.docs.map(d => ({ id: d.id, tces: d.data().tces ?? 0 })).sort((a, b) => b.tces - a.tces);
  for (let i = 0; i < ranked.length; i++) {
    await updateDoc(doc(db, 'units', ranked[i].id), { ranking: i + 1 });
  }

  for (const unitDoc of allUnits.docs) {
    const growth = unitDoc.data().growth as number ?? 0;
    await updateDoc(doc(db, 'units', unitDoc.id), { status: calcStatus(growth) });
  }

  const top5Snap = await getDocs(collection(db, 'top5_audit'));
  for (const entry of top5Snap.docs) {
    const data = entry.data();
    if (data.status === 'Aprovada' || data.status === 'Pendente') {
      const unitSnap = await getDocs(query(collection(db, 'units'), where('nomeFantasia', '==', data.name)));
      const growth = unitSnap.empty ? 0 : (unitSnap.docs[0].data().growth as number ?? 0);
      const diff = parseInt(data.growth?.replace('%', '').replace('+', '') ?? '0', 10);
      if (growth < 0 || diff < 0) {
        await updateDoc(doc(db, 'top5_audit', entry.id), { status: 'Rejeitada' });
      }
    }
  }

  const comparison = Object.entries(batch.summary).map(([razao, today]) => ({
    razaoSocial: razao,
    yesterday: baselineData[razao] ?? 0,
    today,
    diff: today - (baselineData[razao] ?? 0),
  }));
  for (const [razao, yesterday] of Object.entries(baselineData)) {
    if (!batch.summary[razao]) {
      comparison.push({ razaoSocial: razao, yesterday, today: 0, diff: -yesterday });
    }
  }

  return { id: ref.id, comparison };
}

// Training Presence
export async function fetchTrainingPresence(unitId?: string): Promise<{ trainingDate: string; present: boolean }[]> {
  let q = query(collection(db, 'training_presence'), orderBy('trainingDate'));
  if (unitId) q = query(q, where('unitId', '==', unitId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ trainingDate: d.data().trainingDate, present: d.data().present }));
}

export async function saveTrainingPresence(batch: { rows: { unitName: string; dates: { date: string; present: boolean }[] }[]; dates: string[] }): Promise<string> {
  const ref = await addDoc(collection(db, 'training_imports'), { ...batch, createdAt: serverTimestamp() });
  for (const row of batch.rows) {
    for (const d of row.dates) {
      await addDoc(collection(db, 'training_presence'), {
        unitName: row.unitName,
        trainingDate: d.date,
        present: d.present,
        createdAt: serverTimestamp(),
      });
    }
  }
  return ref.id;
}

// Units — create
export async function createUnit(data: Omit<Unit, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'units'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function createUnitsBulk(data: Omit<Unit, 'id'>[]): Promise<number> {
  let count = 0;
  for (const item of data) {
    await createUnit(item);
    count++;
  }
  return count;
}
