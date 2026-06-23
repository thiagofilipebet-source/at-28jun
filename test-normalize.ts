const VARIATION_MAP: Record<string, string> = {
  'APOSTAGANHA': 'APOSTA GANHA',
  'APOSTAGANHABET': 'APOSTA GANHA',
  'APOSTA GANHA BET': 'APOSTA GANHA',
  'BRAVO': 'BRAVOBET',
  'BRAVOBET': 'BRAVOBET',
  'FAZ1BET': 'FAZ 1 BET',
  'FAZ1': 'FAZ 1 BET',
  'ESPORTIVABET': 'ESPORTIVA BET',
  'GANHEIBET': 'GANHEI BET',
  'ESTRELABET': 'ESTRELA BET',
  'TIVOBET': 'TIVO',
  'FASTBET': 'BETFAST',
  'BETFAST': 'BETFAST',
  'PAGOLBET': 'PAGOL',
  'PAGOL': 'PAGOL',
  'GOLDEBET': 'GOL DE BET',
  'OLEY': 'OLEYBET',
  'VERSUS': 'VERSUSBET',
  'VERSUS BET': 'VERSUSBET',
  'ESPORTE DA SORTE': 'ESPORTES DA SORTE',
  'EDS': 'ESPORTES DA SORTE',
  'SPORTING': 'SPORTINGBET',
  'BETSPORTING': 'SPORTINGBET',
  'NACIONALBET': 'BETNACIONAL',
  'BET.BET': 'BETPONTOBET',
  'VUPIBET': 'VUPI',
  'MAXIMA': 'MAXIMABET',
  'MGM': 'BETMGM',
  'MGMBET': 'BETMGM',
  'JOGODEOURO': 'JOGO DE OURO',
  'BR4': 'BR4BET',
  'JOGA JUNTO': 'JOGAJUNTO',
  'BATEU BET': 'BATEUBET',
  'SULBET': 'BETSUL',
};

function normalizeBookmakerName(rawName: string | undefined, defaultName: string = 'Não informada'): string {
  if (!rawName) return defaultName;
  const trimmed = rawName.trim();
  if (!trimmed) return defaultName;
  const upper = trimmed.toUpperCase();
  const mapped = VARIATION_MAP[upper] || trimmed;
  return mapped.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

console.log("VERSUSBET:", normalizeBookmakerName("VERSUSBET"));
console.log("Versusbet:", normalizeBookmakerName("Versusbet"));
console.log("Versus:", normalizeBookmakerName("Versus"));
console.log("Versus bet:", normalizeBookmakerName("Versus bet"));
console.log("Tivo:", normalizeBookmakerName("Tivo")); 
console.log("Tivobet:", normalizeBookmakerName("Tivobet"));
console.log("TIVO:", normalizeBookmakerName("TIVO")); 
