import { Contrato, Respaldo, Tramo } from '../interfaces/contrato';

/** Contratos ficticios del prototipo WPP (los 3 contratos de Óscar). */
export const CONTRATOS: readonly Contrato[] = [
  {
    id: 'ahorro', nom: 'Mi ahorro', num: '100007012618', prod: 'Skandia Inversion Plus',
    saldo: 211306589, disp: 167661397, rcTodo: 19972261, desde: '16 de mar de 2006',
    gan: 118175577, retirado: 217549852, rendSaldo: 71626468, capRet: 171000743, rendRet: 46549109,
    ex: 27472940, sr: 64456893, cc: 83611340, sc: 35765415,
    rr: 3352290 / 157195585, rc: 3243295 / 65265752,
    exacto: { D: 157195585, rc: 3243295, rr: 3352290 },
    port: [
      { nombre: 'FPV Acciones Nuevas Tecnología / FPV_GloNuevTecs', saldo: 93548624, participacion: '44,3 %', rentabilidad: 11.27 },
      { nombre: 'FPV Acciones USA / FPV_USAAcciones', saldo: 43998418, participacion: '20,8 %', rentabilidad: 12.56 },
      { nombre: 'FVP Skandia PRO / FVP_SKPRO', saldo: 43820274, participacion: '20,7 %', rentabilidad: 10.95 },
      { nombre: 'FPV Strategist Liquidez Col / FPV_ColLiquidez', saldo: 29939273, participacion: '14,2 %', rentabilidad: 6.52 },
    ],
    anios: [[2016, 27472940], [2018, 55643715], [2020, 24497456], [2024, 49581475]],
    imp: 30791218 / (157195585 - 27472940), impExacto: 30791218, rentTxt: '14,15',
  },
  {
    id: 'pension', nom: 'Pensión y seguro', num: '100007086103', prod: 'Skandia Capital + Seguro',
    saldo: 202580189, disp: 177993757, rcTodo: 7996800, desde: '4 de dic de 2019',
    gan: 64323904, retirado: 0, rendSaldo: 64323904, capRet: 0, rendRet: 0,
    ex: 18557538, sr: 21737728, cc: 162284923, sc: 0,
    rr: 3115105 / 159588458, rc: 5873353 / 119293193,
    exacto: { D: 159588458, rc: 5873353, rr: 3115105 }, perm: 714000, cerrados: true,
    port: [
      { nombre: 'FPV Strategist Liquidez Col / FPV_ColLiquidez', saldo: 75262691, participacion: '37,2 %', rentabilidad: null },
      { nombre: 'FVP Skandia PRO / FVP_SKPRO', saldo: 55354956, participacion: '27,3 %', rentabilidad: null },
      { nombre: 'FPV Acciones USA / FPV_USAAcciones', saldo: 25130983, participacion: '12,4 %', rentabilidad: null },
      { nombre: 'FPV Acciones Nuevas Tecnología / FPV_GloNuevTecs', saldo: 18689893, participacion: '9,2 %', rentabilidad: null },
      { nombre: 'FPV Acciones Global / FPV_GloAcciones', saldo: 14645889, participacion: '7,2 %', rentabilidad: null },
      { nombre: 'FPV Especial Inmoval / FPV_ColInmoval', saldo: 13495776, participacion: '6,7 %', rentabilidad: null },
    ],
    anios: [[2016, 18557538], [2021, 14335735], [2022, 48773899], [2023, 75257146], [2024, 1073253], [2025, 891591], [2026, 699296]],
    imp: 33124226 / (159588458 - 18557538), impExacto: 33124226, rentTxt: '9,86',
  },
  {
    id: 'finca', nom: 'Proyecto finca', num: '100007600228', prod: 'Skandia Inversion Plus',
    saldo: 68199040, disp: 16767240, rcTodo: 204835, desde: '6 de oct de 2009',
    gan: 53451225, retirado: 92750189, rendSaldo: 26602361, capRet: 65901325, rendRet: 26848864,
    ex: 62580528, sr: 0, cc: 5618512, sc: 0, rr: 0, rc: 0, cerrados: true,
    port: [
      { nombre: 'FPV Especial Inmoval / FPV_ColInmoval', saldo: 51431800, participacion: '75,4 %', rentabilidad: null },
      { nombre: 'FPV Strategist Liquidez Col / FPV_ColLiquidez', saldo: 16767240, participacion: '24,6 %', rentabilidad: null },
    ],
    anios: [[2015, 3404283], [2016, 13362956]],
    imp: 0, rentTxt: '8,61',
  },
  {
    // Ejemplo de 4.º contrato (ficticio) sin nombre personalizado: en pantalla se muestra «Contrato 100007845517».
    // Cifras coherentes entre sí: ex+sr+cc+sc = saldo; gan = rendSaldo+rendRet; rcTodo = cc × rc.
    id: 'cuarto', nom: '', num: '100007845517', prod: 'Skandia Multifund',
    saldo: 95400000, disp: 88950000, rcTodo: 2537600, desde: '9 de ago de 2017',
    gan: 21640000, retirado: 25000000, rendSaldo: 15900000, capRet: 19260000, rendRet: 5740000,
    ex: 12300000, sr: 30100000, cc: 48800000, sc: 4200000,
    rr: 0.018, rc: 0.052,
    port: [
      { nombre: 'FPV Acciones Global / FPV_GloAcciones', saldo: 41200000, participacion: '43,2 %', rentabilidad: null },
      { nombre: 'FVP Skandia PRO / FVP_SKPRO', saldo: 32000000, participacion: '33,5 %', rentabilidad: null },
      { nombre: 'FPV Strategist Liquidez Col / FPV_ColLiquidez', saldo: 22200000, participacion: '23,3 %', rentabilidad: null },
    ],
    anios: [[2017, 30000000], [2019, 25500000], [2022, 24000000]],
    imp: 0.21, rentTxt: '11,42',
  },
];

export const TRAMOS: readonly Tramo[] = [
  { tipo: 'ex', nombre: 'Exento', descripcion: 'Cumplió 10 años o requisitos: sale sin retención.' },
  { tipo: 'sr', nombre: 'Sin retención al retirar', descripcion: 'Sale sin retención contingente, pero puede generar impuesto en la declaración.' },
  { tipo: 'cc', nombre: 'Con retención contingente', descripcion: 'Si sale hoy, se le retiene un porcentaje: es un anticipo del impuesto.' },
  { tipo: 'sc', nombre: 'Sin certificar', descripcion: 'No se puede retirar hasta que se certifique.' },
];

/** Escenarios de renta exenta (WPP: Mi ahorro con $150.000.000 → hasta $30.791.218 · Sí $17.382.058 · No $7.878.038). */
export const RX_SI = 17382058 / 30791218;
export const RX_NO = 7878038 / 30791218;

/** Monto de referencia del prototipo WPP (las cifras exactas son para este retiro). */
export const MONTO_REFERENCIA = 150000000;

export const TASA_CREDITO = 0.1778;
export const TOPE_CREDITO = 156000000;
export const PLAZOS: readonly (readonly [number, string])[] = [[1, '1 mes'], [3, '3 meses'], [6, '6 meses'], [12, '12 meses']];

/** Contratos que respaldan el crédito puente (en orden de bloqueo). */
export const RESPALDO: readonly Respaldo[] = [
  { id: 'pension', disp: 133212571 },
  { id: 'ahorro', disp: 49904770 },
  { id: 'finca', disp: 16373944 },
];

/** Ajuste de rentabilidad por período (orden fijo). */
export const RENT_PER: readonly (readonly ['inicio' | '12' | '6' | '3', string, number])[] = [
  ['inicio', 'Desde el inicio', 0],
  ['12', '12 meses', 1.6],
  ['6', '6 meses', -1.1],
  ['3', '3 meses', 0.7],
];

/** Impuesto del año del cliente sin retirar (pestaña Impuestos). */
export const IMPUESTO_SIN_RETIRO = 41870000;

export const URL_ESPECIFICADO =
  'https://www.skandia.co/documents/39464/1536444/Solicitud-de-retiros-parciales-especificados-Fondo-Voluntario-de-Pension-Skandia-Multifund.pdf/129a497d-78ff-c3fe-c491-d08daf52dca5?version=3.0&t=1757703266312';
export const URL_GUIA_TRANSACCIONES = 'https://www.skandia.co/guia-transacciones-canales-y-servicios';
export const URL_ADMISIBILIDAD = 'https://www.skandia.co/creditos/admisibilidad-de-portafolios';

/** Nombre para mostrar: el personalizado o, si el contrato no tiene, «Contrato {número}». */
export function nombreContrato(c: Contrato): string {
  return c.nom || 'Contrato ' + c.num;
}

/** «Nombre · número», o solo «Contrato {número}» si no tiene nombre personalizado. */
export function etiquetaContrato(c: Contrato): string {
  return c.nom ? c.nom + ' · ' + c.num : 'Contrato ' + c.num;
}

export function contratoPorId(id: string): Contrato {
  return CONTRATOS.find((c) => c.id === id) ?? CONTRATOS[0];
}
