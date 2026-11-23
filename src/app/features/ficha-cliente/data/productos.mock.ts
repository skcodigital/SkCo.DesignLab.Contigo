import { CategoriaProductos, DetalleProducto, Movimiento, TipoProducto } from '../interfaces/productos';

export const CATEGORIAS_PRODUCTOS: readonly CategoriaProductos[] = [
  {
    id: 'ahorro',
    nombre: 'Ahorro Voluntario e inversión',
    icono: 'ahorro',
    abierta: true,
    productos: [
      {
        tipo: 'mf',
        edicion: '-ED',
        nombre: 'Potencializar mi inversión',
        contrato: '#100000063061',
        tag: 'Skandia Capital + Seguros',
        fondo: 'Fondo Voluntario de Pensión Skandia Multifund',
        saldoTotal: '$52.732.191',
      },
      {
        tipo: 'fic',
        nombre: 'Viaje',
        emoji: '✈️',
        contrato: '#301000052847',
        fondo: 'Fondo De Inversión Colectiva Skandia Efectivo',
        saldoTotal: '$8.415.300',
      },
    ],
  },
  { id: 'seguros', nombre: 'Seguros', icono: 'seguros', abierta: false, productos: [] },
];

/** Datos de cada producto de Óscar. El FIC se homologa con Multifund: mismas tarjetas y Composición y saldos. */
export const PRODUCTOS: Readonly<Record<TipoProducto, DetalleProducto>> = {
  mf: {
    tipo: 'mf',
    nombre: 'Potencializar mi inversión',
    contrato: '100000063061',
    fondo: 'Fondo Voluntario de Pensión Skandia Multifund',
    administradora: 'Skandia Pensiones y Cesantías S.A.',
    tag: 'Skandia Capital + Seguros',
    saldoTotal: '$52.732.191',
    saldoRetiro: '$147.650',
    capital: '$47.483.281',
    rendimientos: '$5.248.910',
    pctRendimientos: 10,
    beneficio: { saldoSinPerder: '$0', acumulado: '$0', devuelto: '$0', creditoPreaprobado: '$13.000.000' },
    etiquetaCuentas: 'Cuentas y débito',
  },
  fic: {
    tipo: 'fic',
    nombre: 'Viaje',
    emoji: '✈️',
    contrato: '301000052847',
    fondo: 'Fondo De Inversión Colectiva Skandia Efectivo',
    administradora: 'Skandia Fiduciaria S.A.',
    saldoTotal: '$8.415.300',
    saldoRetiro: '$8.415.300',
    capital: '$7.802.820',
    rendimientos: '$612.480',
    pctRendimientos: 7,
    etiquetaCuentas: 'Cuentas',
  },
};

/** Movimientos del FIC (sección Movimientos). */
export const MOVIMIENTOS_FIC: readonly Movimiento[] = [
  { tipo: 'Adición', fecha: '05/11/2026', bruto: '$ 500.000', neto: '$ 500.000' },
  { tipo: 'Retiro parcial', fecha: '21/10/2026', bruto: '$ -1.200.000', neto: '$ -1.195.200' },
  { tipo: 'Adición', fecha: '05/10/2026', bruto: '$ 500.000', neto: '$ 500.000' },
  { tipo: 'Ajuste', fecha: '30/09/2026', bruto: '$ 1.250', neto: '$ 1.250' },
  { tipo: 'Adición', fecha: '05/09/2026', bruto: '$ 500.000', neto: '$ 500.000' },
  { tipo: 'Retiro parcial', fecha: '18/08/2026', bruto: '$ -800.000', neto: '$ -796.800' },
  { tipo: 'Adición', fecha: '05/08/2026', bruto: '$ 500.000', neto: '$ 500.000' },
  { tipo: 'Adición', fecha: '05/07/2026', bruto: '$ 500.000', neto: '$ 500.000' },
  { tipo: 'Retiro parcial', fecha: '12/06/2026', bruto: '$ -350.000', neto: '$ -348.600' },
  { tipo: 'Adición', fecha: '05/06/2026', bruto: '$ 500.000', neto: '$ 500.000' },
];
