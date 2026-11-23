// Resumen de Empresa ABC S.A. (con PAC): tarjetas, productos y ruta de penetración (datos de ejemplo).
import { GrupoProductos, KpiResumen, RutaPenetracion } from '@features/radiografia/interfaces/resumen';

const AYUDA_PENETRACION = {
  aviso: true,
  etiqueta: 'Atención: el dato de empleados está desactualizado',
  partes: [
    { t: 'Clientes de Skandia que trabajan en la empresa, divididos entre los ' },
    { t: 'empleados reportados', b: true },
    { t: '. El dato de cantidad de empleados totales está actualizado ' },
    { t: 'solo hasta octubre de 2025', b: true },
    { t: '.' },
  ],
};
const AYUDA_CROSSSELL = {
  etiqueta: 'Qué es el cross-sell 2P+',
  partes: [
    { t: 'Porcentaje de clientes de la empresa que tienen ' },
    { t: '2 o más líneas de producto', b: true },
    { t: ' con Skandia (por ejemplo, plan corporativo y cesantías).' },
  ],
};
const AYUDA_SHARE = {
  etiqueta: 'Qué es el share de FPOB',
  partes: [
    { t: 'De los empleados de la empresa afiliados al ' },
    { t: 'FPOB', b: true },
    { t: ' (Fondo de Pensiones Obligatorias) con Skandia, cuántos atiende Agencia Norte: el FP Asignado y los demás asesores de la agencia.' },
  ],
};
const AYUDA_ACTIVOS = {
  etiqueta: 'Qué son los activos de Skandia en la empresa',
  partes: [
    { t: 'Activos que Skandia administra para los empleados de la empresa en pensión obligatoria, voluntaria, cesantías, fiduciaria y el plan corporativo. ' },
    { t: 'No incluye seguros', b: true },
    { t: ': ahí se mide la prima.' },
  ],
};

const VAR_CLIENTES = {
  direccion: 'up',
  texto: '+0,2%',
  etiqueta: 'Subió 0,2% frente a octubre de 2025. Semáforo verde. Hoy 412 clientes; en octubre de 2025, 411.',
  detalle: 'Hoy 412 clientes · oct 2025: 411',
} as const;
const VAR_CROSSSELL = {
  direccion: 'up',
  texto: '+4,8%',
  etiqueta: 'Subió 4,8% frente a octubre de 2025. Semáforo verde. Hoy 173 clientes 2P+; en octubre de 2025, 165.',
  detalle: 'Hoy 173 clientes 2P+ · oct 2025: 165',
} as const;
const VAR_SHARE = {
  direccion: 'down',
  texto: '−7,3%',
  etiqueta: 'Bajó 7,3% frente a octubre de 2025. Semáforo rojo. Hoy 38 afiliados; en octubre de 2025, 41.',
  detalle: 'Hoy 38 afiliados · oct 2025: 41',
} as const;
const VAR_ACTIVOS = {
  direccion: 'up',
  texto: '+6,4%',
  etiqueta: 'Subió 6,4% frente a octubre de 2025. Semáforo verde. Hoy $61.580 M; en octubre de 2025, $57.880 M.',
  detalle: 'Hoy $61.580 M · oct 2025: $57.880 M',
} as const;

/** Tarjetas del Resumen, vista director comercial. */
export const KPIS_RESUMEN_DIRECTOR: readonly KpiResumen[] = [
  {
    etiqueta: 'Clientes activos',
    ayuda: AYUDA_PENETRACION,
    valor: '33,0%',
    variacion: VAR_CLIENTES,
    sub: '412 clientes de 1.250 empleados',
    desglose: [
      { gestion: 'dueno', etiqueta: 'FP Asignado: ', valor: '13,7%', resto: ' · 171 clientes' },
      { gestion: 'agencia', etiqueta: 'Agencia Norte: ', valor: '2,4%', resto: ' · 30 clientes' },
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: '16,9%', resto: ' · 211 clientes' },
    ],
  },
  {
    etiqueta: 'Cross-sell 2P+',
    ayuda: AYUDA_CROSSSELL,
    valor: '42,0%',
    variacion: VAR_CROSSSELL,
    sub: '173 clientes con 2 o más productos',
    desglose: [
      { gestion: 'dueno', etiqueta: 'FP Asignado: ', valor: '46,2%', resto: ' · 79 de 171' },
      { gestion: 'agencia', etiqueta: 'Agencia Norte: ', valor: '60,0%', resto: ' · 18 de 30' },
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: '36,0%', resto: ' · 76 de 211' },
    ],
  },
  {
    etiqueta: 'Share de FPOB de la agencia',
    ayuda: AYUDA_SHARE,
    valor: '30,4%',
    variacion: VAR_SHARE,
    sub: '38 de 125 afiliados a FPOB',
    desglose: [
      { gestion: 'dueno', etiqueta: 'FP Asignado: ', valor: '20,8%', resto: ' · 26 afiliados' },
      { gestion: 'agencia', etiqueta: 'Agencia Norte: ', valor: '9,6%', resto: ' · 12 afiliados' },
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: '69,6%', resto: ' · 87 afiliados' },
    ],
  },
  {
    etiqueta: 'Activos de Skandia en la empresa',
    ayuda: AYUDA_ACTIVOS,
    valor: '$61.580 M',
    variacion: VAR_ACTIVOS,
    sub: 'Plan corporativo $27.400 M',
    desglose: [
      { gestion: 'dueno', etiqueta: 'FP Asignado: ', valor: '$36.550 M', resto: ' · 59%' },
      { gestion: 'agencia', etiqueta: 'Agencia Norte: ', valor: '$3.690 M', resto: ' · 6%' },
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: '$21.340 M', resto: ' · 35%' },
    ],
  },
];

/** Tarjetas del Resumen, vista del FP Asignado: su porción frente a la de otros asesores (agregada). */
export const KPIS_RESUMEN_DUENO: readonly KpiResumen[] = [
  {
    ...KPIS_RESUMEN_DIRECTOR[0],
    desglose: [
      { gestion: 'dueno', etiqueta: 'Tú: ', valor: '13,7%', resto: ' · 171 clientes' },
      { gestion: 'otras', etiqueta: 'Otros asesores: ', valor: '19,3%', resto: ' · 241' },
    ],
  },
  {
    ...KPIS_RESUMEN_DIRECTOR[1],
    desglose: [
      { gestion: 'dueno', etiqueta: 'Tus clientes: ', valor: '46,2%', resto: ' · 79 de 171' },
      { gestion: 'otras', etiqueta: 'Otros asesores: ', valor: '39,0%', resto: ' · 94 de 241' },
    ],
  },
  {
    ...KPIS_RESUMEN_DIRECTOR[2],
    desglose: [
      { gestion: 'dueno', etiqueta: 'Tú: ', valor: '26', resto: '' },
      { gestion: 'agencia', etiqueta: 'Agencia Norte: ', valor: '12', resto: '' },
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: '87', resto: '' },
    ],
  },
  {
    ...KPIS_RESUMEN_DIRECTOR[3],
    desglose: [
      { gestion: 'dueno', etiqueta: 'Tú: ', valor: '$36.550 M', resto: ' · 59%' },
      { gestion: 'otras', etiqueta: 'Otros asesores: ', valor: '$25.030 M', resto: ' · 41%' },
    ],
  },
];

/** Tarjetas del Resumen, vista del asesor (otro FP): solo sus clientes en la empresa. */
export const KPIS_RESUMEN_FP: readonly KpiResumen[] = [
  {
    etiqueta: 'Tus clientes en esta empresa',
    valor: '2',
    lista: { clave: 'clientes', etiqueta: 'Ver tus 2 clientes en esta empresa' },
    sub: '3 productos entre los dos',
  },
  {
    etiqueta: 'Cross-sell 2P+ de tus clientes',
    ayuda: {
      etiqueta: 'Qué es el cross-sell 2P+',
      partes: [
        { t: 'Porcentaje de clientes que tienen ' },
        { t: '2 o más líneas de producto', b: true },
        { t: ' con Skandia (por ejemplo, obligatoria y voluntaria).' },
      ],
    },
    valor: '50,0%',
    sub: '1 de tus 2 clientes tiene 2 o más productos',
  },
  {
    etiqueta: 'Tus activos en esta empresa',
    ayuda: {
      etiqueta: 'Qué son tus activos en esta empresa',
      partes: [
        { t: 'Activos que administras para tus clientes de esta empresa en obligatoria, voluntaria, cesantías y fiduciaria. ' },
        { t: 'No incluye seguros', b: true },
        { t: '.' },
      ],
    },
    valor: '$142,5 M',
    sub: 'Tus clientes no tienen seguros',
  },
  {
    etiqueta: 'Neto de clientes 2026',
    ayuda: {
      etiqueta: 'Qué es el neto',
      partes: [{ t: 'Clientes nuevos menos clientes perdidos', b: true }, { t: ' en el año.' }],
    },
    valor: '0',
    sub: '1 nuevo · 1 perdido (a octubre)',
  },
];

/** Productos de la empresa (director y FP Asignado). Solo "Ahorro e inversión" arranca abierto. */
export const PRODUCTOS_EMPRESA: readonly GrupoProductos[] = [
  {
    titulo: 'Ahorro e inversión',
    icono: 'savings',
    productos: [
      { nombre: 'Programa Bonificaciones | #PC1288', monto: '$1.726.886.799,30', meta: 'Plan de Ahorro Corporativo · Saldo total' },
      { nombre: 'Programa Bonificaciones | #PC2615', monto: '$799.558.477,70', meta: 'Plan de Ahorro Corporativo · Saldo total' },
      { nombre: 'Programa Ahorro Mutuo | #PC0001', monto: '$530.643.394,95', meta: 'Plan de Ahorro Corporativo · Saldo total' },
      { nombre: 'Programa Bonificaciones | #PC2553', monto: '$396.675.788,24', meta: 'Plan de Ahorro Corporativo · Saldo total' },
    ],
  },
  {
    titulo: 'Seguros',
    icono: 'insure',
    productos: [{ nombre: 'Vida Grupo | #VG4471', monto: '$186.400.000', meta: 'Seguro colectivo de vida · Prima anual' }],
  },
];

/** Productos de la empresa vistos por el asesor que no es dueño: se ven, pero no se puede ingresar. */
export const PRODUCTOS_BLOQUEADOS: readonly GrupoProductos[] = [
  {
    titulo: 'Ahorro e inversión',
    icono: 'savings',
    productos: [
      { nombre: 'Programa Bonificaciones | #PC1288', meta: 'Plan de Ahorro Corporativo · Lo atiende el FP Asignado' },
      { nombre: 'Programa Bonificaciones | #PC2615', meta: 'Plan de Ahorro Corporativo · Lo atiende el FP Asignado' },
      { nombre: 'Programa Ahorro Mutuo | #PC0001', meta: 'Plan de Ahorro Corporativo · Lo atiende el FP Asignado' },
      { nombre: 'Programa Bonificaciones | #PC2553', meta: 'Plan de Ahorro Corporativo · Lo atiende el FP Asignado' },
    ],
  },
];

const HOY = { pos: 33, etiqueta: 'Hoy · 33,0%' };
const META = { pos: 45, etiqueta: 'Meta 2027 · 45%' };
const ALERTA_RUTA = [
  { t: 'Hoy estás en ' },
  { t: '33,0%', b: true },
  { t: ' · Meta 2027: ' },
  { t: '45%', b: true },
  { t: ' (562 de 1.250 empleados) · faltan ' },
  { t: '150 clientes', b: true },
  { t: '. Para llegar a la meta se necesitan ' },
  { t: '10 clientes netos al mes', b: true },
  { t: '; en 2026 el neto va en +1.' },
];

export const RUTA_PENETRACION_DIRECTOR: RutaPenetracion = {
  aria: 'Clientes activos hoy 33 por ciento: FP Asignado 13,7, Agencia Norte 2,4, otras agencias 16,9. Meta 2027: 45 por ciento.',
  segmentos: [
    { gestion: 'dueno', ancho: 13.7 },
    { gestion: 'agencia', ancho: 2.4 },
    { gestion: 'otras', ancho: 16.9 },
  ],
  hoy: HOY,
  meta: META,
  leyenda: [
    { gestion: 'dueno', texto: 'FP Asignado' },
    { gestion: 'agencia', texto: 'Agencia Norte' },
    { gestion: 'otras', texto: 'Otras agencias' },
    { gestion: 'vacio', texto: 'Sin relación: 838 empleados' },
  ],
  alerta: ALERTA_RUTA,
};

export const RUTA_PENETRACION_DUENO: RutaPenetracion = {
  aria: 'Clientes activos hoy 33 por ciento: tú 13,7, otros asesores 19,3. Meta 2027: 45 por ciento.',
  segmentos: [
    { gestion: 'dueno', ancho: 13.7 },
    { gestion: 'otras', ancho: 19.3 },
  ],
  hoy: HOY,
  meta: META,
  leyenda: [
    { gestion: 'dueno', texto: 'Tú' },
    { gestion: 'otras', texto: 'Otros asesores (agregado)' },
    { gestion: 'vacio', texto: 'Sin relación: 838 empleados' },
  ],
  alerta: ALERTA_RUTA,
};
