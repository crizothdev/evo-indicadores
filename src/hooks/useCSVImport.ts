import { useState, useCallback } from 'react';
import { parseDailyTCE, parseTrainingPresence, parseFranchiseCSV, type CSVImportResult, type FranchiseImportResult } from '@/services/csvParser';

export function useCSVImport() {
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [trainingResult, setTrainingResult] = useState<{
    rows: { unitName: string; dates: { date: string; present: boolean }[] }[];
    dates: string[];
    errors: string[];
  } | null>(null);
  const [franchiseResult, setFranchiseResult] = useState<FranchiseImportResult | null>(null);

  const importDailyTCE = useCallback((csvText: string) => {
    const r = parseDailyTCE(csvText);
    setResult(r);
    return r;
  }, []);

  const importTraining = useCallback((csvText: string) => {
    const r = parseTrainingPresence(csvText);
    setTrainingResult(r);
    return r;
  }, []);

  const importFranchises = useCallback((csvText: string) => {
    const r = parseFranchiseCSV(csvText);
    setFranchiseResult(r);
    return r;
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setTrainingResult(null);
    setFranchiseResult(null);
  }, []);

  return { result, trainingResult, franchiseResult, importDailyTCE, importTraining, importFranchises, reset };
}
