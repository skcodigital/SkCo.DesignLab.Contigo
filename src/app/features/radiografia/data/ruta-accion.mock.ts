import { Gestion, ParteTexto } from '@features/radiografia/interfaces/radiografia';
import { ConfigRuta, MetaId, SeguimientoMeta } from '@features/radiografia/interfaces/ruta-accion';

/** Empresa ABC S.A. (con PAC): los mismos datos del Resumen. */
export const CONFIG_RUTA_CON_PAC: ConfigRuta = {
  hoy: { empleados: 1250, clientes: 412, clientes2p: 173, afiliados: 125, agencia: 38 },
  penetracionHoy: '33,0%',
  baseProfundizar: 42,
  baseConsolidar: 30,
  retenerHoy: '+1',
  sugeridas: { activar: 150, profundizar: 50, consolidar: 40, retener: 10 },
  minimos: { activar: 0, profundizar: 42, consolidar: 30, retener: 0 },
  empresa: 'Empresa ABC S.A.',
};

/** Empresa XYZ S.A.S. (sin PAC). */
export const CONFIG_RUTA_SIN_PAC: ConfigRuta = {
  hoy: { empleados: 120, clientes: 11, clientes2p: 4, afiliados: 11, agencia: 7 },
  penetracionHoy: '9,2%',
  baseProfundizar: 36,
  baseConsolidar: 64,
  retenerHoy: '0',
  sugeridas: { activar: 7, profundizar: 50, consolidar: 73, retener: 2 },
  minimos: { activar: 0, profundizar: 36, consolidar: 64, retener: 0 },
  empresa: 'Empresa XYZ S.A.S.',
};

/** Orden de las metas en la modal y en las cajitas. */
export const METAS: readonly MetaId[] = ['activar', 'profundizar', 'consolidar', 'retener'];

/** Seguimiento de cada meta (datos de ejemplo de Empresa ABC S.A.). */
export const SEGUIMIENTO: Readonly<Record<MetaId, SeguimientoMeta>> = {
  activar: { nombre: 'Activar · penetración', hoyDemo: 34.2, ini: 33.0, pre: '+', unidad: 'clientes nuevos' },
  profundizar: { nombre: 'Profundizar · cross-sell 2P+', hoyDemo: 44.5, ini: 42.0, pre: '', unidad: '% con 2 o más productos' },
  consolidar: { nombre: 'Consolidar · share de FPOB', hoyDemo: 31.2, ini: 30.4, pre: '', unidad: '% de share' },
  retener: { nombre: 'Retener · neto anual de clientes', hoyDemo: 4, ini: 1, pre: '+', unidad: 'de neto anual' },
};

/** Prefijo y unidad del campo de la modal "Editar meta". */
export const UNIDAD_META: Readonly<Record<MetaId, readonly [string, string]>> = {
  activar: ['+', 'clientes nuevos'],
  profundizar: ['', '% con 2 o más productos'],
  consolidar: ['', '% de share'],
  retener: ['+', 'de neto anual'],
};

/** FP Asignado de Empresa ABC S.A. (destinatario de la ruta). */
export const FP_ASIGNADO = 'Juan Alberto Rodríguez González';

/** Quién atiende a los clientes de una etapa (línea `.step-who` de la cajita). */
export interface QuienPaso {
  readonly gestion: Gestion;
  readonly texto: string;
  /** Agregado, sin detalle (candado). */
  readonly candado?: boolean;
}

/** Cajita del diagnóstico de la Ruta comercial (Empresa ABC S.A.). */
export interface PasoRuta {
  readonly id: MetaId;
  readonly num: number;
  readonly aviso?: boolean;
  readonly etapa: string;
  readonly titulo: string;
  readonly desc: Readonly<Record<'director' | 'dueno', string>>;
  readonly quien: Readonly<Record<'director' | 'dueno', readonly QuienPaso[]>>;
  /** Meta sugerida del diagnóstico (antes de crear la ruta). */
  readonly meta: readonly ParteTexto[];
}

export const PASOS_RUTA: readonly PasoRuta[] = [
  {
    id: 'activar',
    num: 1,
    etapa: 'Activar',
    titulo: '838 empleados sin relación',
    desc: {
      director: 'Vinculación en nómina y jornadas en la sede de la empresa.',
      dueno: 'Vinculación en nómina y jornadas en la sede de la empresa.',
    },
    quien: { director: [], dueno: [] },
    meta: [{ t: 'Meta: ' }, { t: '+150 clientes', b: true }, { t: ' → ' }, { t: '45%', b: true }],
  },
  {
    id: 'profundizar',
    num: 2,
    etapa: 'Profundizar',
    titulo: '239 clientes monoproducto',
    desc: {
      director: 'Segundo producto: voluntaria o plan corporativo.',
      dueno: 'Segundo producto: voluntaria o plan corporativo.',
    },
    quien: {
      director: [
        { gestion: 'dueno', texto: '92 del FP Asignado' },
        { gestion: 'otras', texto: '147 de otros asesores', candado: true },
      ],
      dueno: [
        { gestion: 'dueno', texto: '92 tuyos' },
        { gestion: 'otras', texto: '147 de otros asesores', candado: true },
      ],
    },
    meta: [{ t: 'Meta: 2P+ de 42% a ' }, { t: '50%', b: true }, { t: ' (+33 clientes)' }],
  },
  {
    id: 'consolidar',
    num: 3,
    etapa: 'Consolidar',
    titulo: '87 afiliados a FPOB con otras agencias',
    desc: {
      director: 'Coordinar con las otras agencias para que la empresa tenga un solo frente.',
      dueno: 'No ves quiénes son: la coordinación pasa por tu director.',
    },
    quien: { director: [], dueno: [] },
    meta: [{ t: 'Meta: share de 30% a ' }, { t: '40%', b: true }, { t: ' (+12 afiliados)' }],
  },
  {
    id: 'retener',
    num: 4,
    aviso: true,
    etapa: 'Retener',
    titulo: '11 clientes perdidos en la empresa en 2026',
    desc: {
      director: 'Alertas tempranas de retiro y de salida de la empresa.',
      dueno: 'Alertas tempranas de retiro y de salida de la empresa.',
    },
    quien: {
      director: [
        { gestion: 'dueno', texto: '2 del FP Asignado' },
        { gestion: 'agencia', texto: '1 de Agencia Norte' },
        { gestion: 'otras', texto: '8 de otras agencias' },
      ],
      dueno: [
        { gestion: 'dueno', texto: '2 tuyos' },
        { gestion: 'otras', texto: '9 de otros asesores' },
      ],
    },
    meta: [{ t: 'Meta: neto anual ' }, { t: '≥ +10', b: true }],
  },
];
