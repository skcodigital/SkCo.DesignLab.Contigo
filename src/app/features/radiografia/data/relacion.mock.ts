// Relación integral de Empresa ABC S.A. (con PAC): activos administrados por línea de negocio (datos de ejemplo).
import { LineaNegocio, RelacionIntegral } from '@features/radiografia/interfaces/resumen';
import { Gestion } from '@features/radiografia/interfaces/radiografia';

const SUB: Readonly<Record<string, readonly string[]>> = {
  'Total en la empresa': ['Sin seguros'],
  'Plan de Ahorro Corporativo': ['Voluntaria corporativa'],
  'Pensión obligatoria': ['FPOB'],
  'Pensión voluntaria': ['Multifund individual'],
  Cesantías: [],
  Seguros: ['Primas anuales'],
  Fiduciaria: ['FICs'],
};

/** Línea del director: FP Asignado, Agencia Norte (sin valor en la barra) y otras agencias (con candado). */
function lineaDirector(
  nombre: string,
  clientes: string,
  [dueno, agencia, otras]: readonly [string, string, string],
  [aDueno, aAgencia, aOtras]: readonly [number, number, number],
  pctDueno: string,
): LineaNegocio {
  return {
    nombre,
    subtitulos: SUB[nombre] ?? [],
    clientes,
    total: nombre === 'Total en la empresa',
    aria: `${nombre}: FP Asignado ${dueno}, Agencia Norte ${agencia}, otras agencias ${otras}`,
    tramos: [
      { gestion: 'dueno', ancho: aDueno, valor: dueno },
      { gestion: 'agencia', ancho: aAgencia },
      { gestion: 'otras', ancho: aOtras, valor: otras, candado: 'decorativo' },
    ],
    detalle: [
      { gestion: 'dueno', etiqueta: 'FP Asignado: ', valor: dueno, resto: ` · ${pctDueno}` },
      { gestion: 'agencia', etiqueta: 'Agencia Norte: ', valor: agencia, resto: '' },
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: otras, resto: '' },
    ],
  };
}

/** Línea del FP Asignado: su porción frente a otros asesores (agregado, sin detalle). */
function lineaDueno(
  nombre: string,
  clientes: string,
  [tu, otros]: readonly [string, string],
  [aTu, aOtros]: readonly [number, number],
  pctTu: string,
): LineaNegocio {
  return {
    nombre,
    subtitulos: SUB[nombre] ?? [],
    clientes,
    total: nombre === 'Total en la empresa',
    aria: `${nombre}: tú ${tu}, otros asesores ${otros}`,
    tramos: [
      { gestion: 'dueno', ancho: aTu, valor: tu },
      { gestion: 'otras', ancho: aOtros, valor: otros, candado: 'agregado' },
    ],
    detalle: [
      { gestion: 'dueno', etiqueta: 'Tú: ', valor: tu, resto: ` · ${pctTu}` },
      { gestion: 'otras', etiqueta: 'Otros asesores: ', valor: otros, resto: '' },
    ],
  };
}

/** Plan de Ahorro Corporativo: todo lo atiende el FP Asignado (una sola barra y una nota). */
function lineaPlan(quien: Gestion, aria: string, etiqueta: string, nota: string): LineaNegocio {
  return {
    nombre: 'Plan de Ahorro Corporativo',
    subtitulos: SUB['Plan de Ahorro Corporativo'],
    clientes: '96 clientes',
    aria,
    tramos: [{ gestion: quien, ancho: 100, valor: '$27.400 M' }],
    detalle: [{ gestion: quien, etiqueta, valor: '$27.400 M', resto: ' · 100%' }],
    nota,
  };
}

export const RELACION_DIRECTOR: RelacionIntegral = {
  titulo: 'Activos administrados por línea de negocio',
  sub: 'Lo que atiende el FP Asignado frente a Agencia Norte y otras agencias, línea por línea. En seguros se mide la prima anual.',
  leyenda: [
    { gestion: 'dueno', texto: 'FP Asignado' },
    { gestion: 'agencia', texto: 'Agencia Norte' },
    { gestion: 'otras', texto: 'Otras agencias' },
  ],
  lineas: [
    lineaDirector('Total en la empresa', '412 clientes', ['$36.550 M', '$3.690 M', '$21.340 M'], [59.4, 6.0, 34.7], '59%'),
    lineaPlan(
      'dueno',
      'Plan de Ahorro Corporativo: FP Asignado $27.400 M, Agencia Norte $0 M, otras agencias $0 M',
      'FP Asignado: ',
      'Todo el plan lo atiende el FP Asignado',
    ),
    lineaDirector('Pensión obligatoria', '125 clientes', ['$3.900 M', '$1.800 M', '$13.050 M'], [20.8, 9.6, 69.6], '21%'),
    lineaDirector('Pensión voluntaria', '168 clientes', ['$4.100 M', '$1.300 M', '$4.200 M'], [42.7, 13.5, 43.8], '43%'),
    lineaDirector('Cesantías', '141 clientes', ['$450 M', '$240 M', '$1.440 M'], [21.1, 11.3, 67.6], '21%'),
    lineaDirector('Seguros', '52 clientes', ['$180 M', '$40 M', '$190 M'], [43.9, 9.8, 46.3], '44%'),
    lineaDirector('Fiduciaria', '38 clientes', ['$700 M', '$350 M', '$2.650 M'], [18.9, 9.5, 71.6], '19%'),
  ],
  hallazgo: [
    { t: 'El FP Asignado administra el ' },
    { t: '59%', b: true },
    { t: ' de los activos de Skandia en la empresa, pero 3 de cada 4 de esos pesos son del plan corporativo. En las demás líneas tiene el ' },
    { t: '27%', b: true },
    { t: '.' },
  ],
};

export const RELACION_DUENO: RelacionIntegral = {
  titulo: 'Activos administrados por línea de negocio',
  sub: 'Tu porción frente a la de otros asesores, línea por línea. En seguros se mide la prima anual.',
  leyenda: [
    { gestion: 'dueno', texto: 'Tú' },
    { gestion: 'otras', texto: 'Otros asesores (agregado, sin detalle)' },
  ],
  lineas: [
    lineaDueno('Total en la empresa', '412 clientes', ['$36.550 M', '$25.030 M'], [59.4, 40.6], '59%'),
    lineaPlan('dueno', 'Plan de Ahorro Corporativo: tú $27.400 M, otros asesores $0 M', 'Tú: ', 'El plan es 100% tuyo'),
    lineaDueno('Pensión obligatoria', '125 clientes', ['$3.900 M', '$14.850 M'], [20.8, 79.2], '21%'),
    lineaDueno('Pensión voluntaria', '168 clientes', ['$4.100 M', '$5.500 M'], [42.7, 57.3], '43%'),
    lineaDueno('Cesantías', '141 clientes', ['$450 M', '$1.680 M'], [21.1, 78.9], '21%'),
    lineaDueno('Seguros', '52 clientes', ['$180 M', '$230 M'], [43.9, 56.1], '44%'),
    lineaDueno('Fiduciaria', '38 clientes', ['$700 M', '$3.000 M'], [18.9, 81.1], '19%'),
  ],
  hallazgo: [
    { t: 'Sin contar el plan corporativo, gestionas el ' },
    { t: '27%', b: true },
    { t: ' de los activos que Skandia tiene en la empresa ($9.150 M de $34.180 M). Obligatoria es donde más pesa lo de otros asesores: ' },
    { t: '$14.850 M', b: true },
    { t: '.' },
  ],
};

/** Línea del asesor: solo lo suyo, con el número de clientes como nota. */
function lineaFp(nombre: string, valor: string, ancho: number, conValor: boolean): LineaNegocio {
  return {
    nombre,
    subtitulos: SUB[nombre] ?? [],
    aria: `${nombre}: ${valor}, 1 cliente`,
    tramos: [{ gestion: 'dueno', ancho, valor: conValor ? valor : undefined }],
    detalle: [{ gestion: 'dueno', etiqueta: '', valor, resto: '' }],
    nota: '1 cliente',
  };
}

export const RELACION_FP: RelacionIntegral = {
  titulo: 'Tus líneas de negocio',
  sub: 'Lo que tienen tus clientes de esta empresa.',
  leyenda: [],
  lineas: [
    lineaFp('Pensión obligatoria', '$96,3 M', 100, true),
    lineaFp('Pensión voluntaria', '$38,0 M', 39.5, true),
    lineaFp('Cesantías', '$8,2 M', 8.5, false),
  ],
  hallazgo: [
    { t: 'Mariana Quintero', b: true },
    { t: ' solo tiene cesantías contigo. Ofrecerle pensión voluntaria es tu oportunidad más clara en esta empresa.' },
  ],
};
