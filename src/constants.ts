const BASE_URL = (import.meta as any).env.BASE_URL || '/';

export const BOOKMAKER_LOGOS: Record<string, string> = {
  'LOTTU': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780010515/afafa6f6-e116-4734-979e-98abcd5629f6_cd9fk4.png',
  'BETANO': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777482545/betano_mrnnvu.svg',
  'ESPORTES DA SORTE': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777482801/esportes-da-sorte-logo-8_qvmcvl.svg',
  'SPORTINGBET': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777483386/sportingbet-seeklogo_emdmrh.png',
  'ESPORTIVA BET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780639020/esportiva_oipx06.png',
  'BOLSA DE APOSTA': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980150/bolsadeaposta_lxnv7f.svg',
  'REI DO PITACO': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780642456/pitaco-logo_u9qq4p.svg',
  'BETESPORTE': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781370833/BETESPORTE_p4mraf.svg',
  'VAIDEBET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780642804/vaidebet_wrwxze.svg',
  'BETFAIR': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780722030/betfair-logo_khycnu.svg',
  'NOVIBET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780723983/NOVIBET_kwky4p.svg',
  'ESTRELA BET': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777498444/estrelaa_l9igap.png',
  '4WIN': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980695/4win_wkj0vm.svg',
  'BETBOO': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781370471/2d34ec3ccbe04ed39412a2cc1e24fd6b_xu0g5x.svg',
  'GANHEI BET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781371171/ganheibet_o8wuhx.svg',
  'BETNACIONAL': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781370200/betnacional-logo_ymibrd.svg',
  'KTO': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780640675/logo-kto_oklg1u.svg',
  'BET365': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781371350/bet365_x8wrex.svg',
  'FAZ 1 BET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980052/faz1bet_clssww.png',
  'PAGOL': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777521415/PAGOLL_orbx2w.png',
  'PAGOL BET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781371235/pagol_ortqbr.svg',
  'BETPONTOBET': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777522269/3f178b7fe50ce326f4c62a-bet.bet_logo_horizontal_laranja_omkdxq.png',
  'BETFAST': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780723132/BETFAST_nrvlzo.png',
  'SUPERBET': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777522817/superbet-logo_d4pgg8.svg',
  'MATCHBOOK': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777523000/Matchbook_by1kle.png',
  'TIVO': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777523220/tivo_fn0lav.png',
  'GOL DE BET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780723354/logo_lnlwzl.avif',
  'VUPI': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780641372/logo-vupi-completa_1_kjshwe.svg',
  'MAXIMABET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980414/maximabet-logo-transparente_oevgpb.svg',
  'BETMGM': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780723838/MGM_bsbzdm.svg',
  'OLEYBET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980783/oley_xftrni.png',
  'JOGO DE OURO': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780641883/jogodeouro_onrjac.png',
  'VERSUSBET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780723678/VERSUS_zwtng9.svg',
  'HIPERBET': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777526747/hiperbet_du5l4u.png',
  'LOTOGREEN': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777526886/LOTOGREEN_hnyb2p.svg',
  'MC GAMES': 'https://res.cloudinary.com/dfnndawb7/image/upload/v1777529147/MC999_xaj2ey.png',
  'BETVIP': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780721971/betvip_zvcnlj.avif',
  'STAKE': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780722101/stake_wrqgsr.svg',
  'BETPIX365': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780641984/betpix_zhie6b.svg',
  'VIVASORTE': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780723428/logo_d2jrfr.svg',
  'BR4BET': 'https://res.cloudinary.com/duex6jo6v/image/upload/v1778347620/BR4_e39kgl.png',
  'JOGAJUNTO': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980834/jgoajunto_s2om4r.svg',
  'BATEUBET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780641760/bateubet_rsztv8.svg',
  'BETGORILLAS': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1779590877/w_1200_ek3ymi.svg',
  'BETSUL': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781323733/betsul2_gugz6s.svg',
  'BRAVOBET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780009395/logo-1_vsgfan.svg',
  'APOSTA GANHA': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780009383/logo-horizontal-black_mq7gsz.svg',
  'PLAYBET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980029/playbet_rmzlne.avif',
  'GALERABET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980256/galerabet_zbrexn.svg',
  'BETFUSION': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1780980479/light_wizwyf.png',
  'GINGABET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781322485/ginga_fbczec.avif',
  'KINGPANDA': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781322443/logo-black-kingpanda_xxbpni.svg',
  'ULTRABET': 'https://res.cloudinary.com/docnr0i0s/image/upload/v1781322902/logo_1_q2q8le.svg',
};


export const VARIATION_MAP: Record<string, string> = {
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

export const SPORT_EMOJIS: Record<string, string> = {
  'Futebol': '⚽',
  'Basquetebol': '🏀',
  'Basquete': '🏀',
  'Ténis': '🎾',
  'Tênis': '🎾',
  'Voleibol': '🏐',
  'Hóquei no gelo': '🏒',
  'Futebol americano': '🏈',
  'Beisebol': '⚾️',
  'MMA': '🥊',
  'Fórmula 1': '🏎️',
  'eSport': '🎮',
  'E-Sports': '🎮',
  'Outro esporte': '🏅',
};

export const SPORTS_LIST = [
  'Futebol',
  'Ténis',
  'Basquete',
  'Voleibol',
  'Hóquei no gelo',
  'Futebol americano',
  'Beisebol',
  'MMA',
  'Fórmula 1',
  'eSport',
  'Outro esporte'
];

export const CANONICAL_BOOKMAKER_LIST = Array.from(new Set([
  ...Object.keys(BOOKMAKER_LOGOS),
  ...Object.values(VARIATION_MAP)
])).sort();

export const BOOKMAKER_LIST = CANONICAL_BOOKMAKER_LIST;

export function normalizeBookmakerName(rawName: string | undefined, defaultName: string = 'Não informada'): string {
  if (!rawName) return defaultName;
  const trimmed = rawName.trim();
  if (!trimmed) return defaultName;
  const upper = trimmed.toUpperCase();
  const mapped = VARIATION_MAP[upper] || trimmed;
  return mapped.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
