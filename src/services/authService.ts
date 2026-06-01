import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { createUserDoc } from '@/services/firestoreService';
import type { User, Role } from '@/types';

function formatUser(uid: string, data: Record<string, unknown>, fbUser: FirebaseUser): User {
  return {
    id: uid,
    name: (data.name as string) ?? fbUser.displayName ?? fbUser.email ?? '',
    email: (data.email as string) ?? fbUser.email ?? '',
    role: (data.role as Role) ?? 'franchise',
    unitId: (data.unitId as string) ?? undefined,
    active: (data.active as boolean) ?? true,
    approved: (data.approved as boolean) ?? true,
  };
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (userDoc.exists()) {
    return formatUser(cred.user.uid, userDoc.data(), cred.user);
  }
  return formatUser(cred.user.uid, {}, cred.user);
}

export async function registerUser(email: string, password: string, name: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(cred.user.uid, { name, email });
  return {
    id: cred.user.uid,
    name,
    email,
    role: 'franchise' as Role,
    active: true,
    approved: false,
  };
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        callback(formatUser(fbUser.uid, userDoc.data(), fbUser));
      } else {
        callback(formatUser(fbUser.uid, {}, fbUser));
      }
    } catch {
      callback(null);
    }
  });
}
