export interface CSVImportRow {
  razaoSocial: string;
  date?: string;
}

export interface CSVImportResult {
  rows: CSVImportRow[];
  errors: string[];
  summary: Record<string, number>;
}

export interface FranchiseRow {
  razaoSocial: string;
  unidade: string;
  uf: string;
  regiao: string;
  contrato: string;
  franqueado: string;
  dataNascimento: string;
  profissao: string;
  cnpj: string;
  cep: string;
  telefone: string;
  email: string;
  status: string;
  homeOffice: string;
  dataInicio: string;
  dataRescisao: string;
  dataFinal: string;
  vencimento: string;
  dataRenovacao: string;
  data2Renovacao: string;
  vencimento2: string;
  dataInicioRoyalties: string;
  valor: string;
  igpm: string;
}

export interface FranchiseImportResult {
  rows: FranchiseRow[];
  errors: string[];
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if ((char === ',' || char === ';') && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

export function parseDailyTCE(csvText: string): CSVImportResult {
  const lines = csvText.trim().split('\n').filter(l => l.trim());
  const errors: string[] = [];
  const rows: CSVImportRow[] = [];

  if (lines.length < 1) {
    return { rows: [], errors: ['CSV vazio'], summary: {} };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const cols = parseLine(line);
    const name = cols.length === 1 ? cols[0] : cols[2];

    if (!name) {
      errors.push(`Linha ${i + 1}: nome da unidade vazio`);
      continue;
    }

    rows.push({ razaoSocial: name });
  }

  const summary: Record<string, number> = {};
  for (const row of rows) {
    const key = row.razaoSocial;
    summary[key] = (summary[key] ?? 0) + 1;
  }

  return { rows, errors, summary };
}

export function parseTrainingPresence(csvText: string): { rows: { unitName: string; dates: { date: string; present: boolean }[] }[]; dates: string[]; errors: string[] } {
  const lines = csvText.trim().split('\n').filter(l => l.trim());
  const errors: string[] = [];
  const rows: { unitName: string; dates: { date: string; present: boolean }[] }[] = [];

  if (lines.length < 2) {
    return { rows: [], dates: [], errors: ['CSV precisa ter cabeçalho + pelo menos 1 linha de dados'] };
  }

  const headers = parseLine(lines[0]);
  const dateHeaders = headers.slice(1);

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 1 || !cols[0]) continue;

    const unitName = cols[0];
    const dates = dateHeaders.map((date, idx) => ({
      date,
      present: (cols[idx + 1] ?? '').toLowerCase() === 'ok',
    }));

    rows.push({ unitName, dates });
  }

  return { rows, dates: dateHeaders, errors };
}

export function parseFranchiseCSV(csvText: string): FranchiseImportResult {
  const lines = csvText.trim().split('\n').filter(l => l.trim());
  const errors: string[] = [];
  const rows: FranchiseRow[] = [];

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV precisa ter cabeçalho + dados'] };
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 1 || (!cols[0] && !cols[5])) {
      errors.push(`Linha ${i + 1}: sem razão social ou franqueado`);
      continue;
    }

    rows.push({
      razaoSocial: cols[0] ?? '',
      unidade: cols[1] ?? '',
      uf: cols[2] ?? '',
      regiao: cols[3] ?? '',
      contrato: cols[4] ?? '',
      franqueado: cols[5] ?? '',
      dataNascimento: cols[6] ?? '',
      profissao: cols[7] ?? '',
      cnpj: cols[8] ?? '',
      cep: cols[9] ?? '',
      telefone: cols[10] ?? '',
      email: cols[11] ?? '',
      status: cols[12] ?? '',
      homeOffice: cols[13] ?? '',
      dataInicio: cols[14] ?? '',
      dataRescisao: cols[15] ?? '',
      dataFinal: cols[16] ?? '',
      vencimento: cols[17] ?? '',
      dataRenovacao: cols[18] ?? '',
      data2Renovacao: cols[19] ?? '',
      vencimento2: cols[20] ?? '',
      dataInicioRoyalties: cols[21] ?? '',
      valor: cols[22] ?? '',
      igpm: cols[23] ?? '',
    });
  }

  return { rows, errors };
}
