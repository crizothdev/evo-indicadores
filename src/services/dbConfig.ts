const STORAGE_KEY = 'evo_db_read_source';

export type ReadSource = 'firebase' | 'local';

export function getReadSource(): ReadSource {
  if (typeof window === 'undefined') return 'firebase';
  return (localStorage.getItem(STORAGE_KEY) as ReadSource) ?? 'firebase';
}

export function setReadSource(source: ReadSource): void {
  localStorage.setItem(STORAGE_KEY, source);
}
