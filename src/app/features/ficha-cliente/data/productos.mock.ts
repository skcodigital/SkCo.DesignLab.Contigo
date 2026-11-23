import { CategoriaProductos, DetalleProducto } from '../interfaces/productos';

export const CATEGORIAS_PRODUCTOS: readonly CategoriaProductos[] = [
  {
    id: 'ahorro',
    nombre: 'Ahorro Voluntario e inversión',
    icono: 'ahorro',
    abierta: true,
    productos: [
      {
        edicion: '-ED',
        nombre: 'Potencializar mi inversión',
        contrato: '#100000063061',
        tag: 'Skandia Capital + Seguros',
        fondo: 'Fondo Voluntario de Pensión Skandia Multifund',
        saldoTotal: '$52.732.191',
      },
    ],
  },
  { id: 'seguros', nombre: 'Seguros', icono: 'seguros', abierta: false, productos: [] },
];

export const PRODUCTO_POTENCIALIZAR: DetalleProducto = {
  nombre: 'Potencializar mi inversión',
  contrato: '100000063061',
  fondo: 'Fondo Voluntario de Pensión Skandia Multifund',
  administradora: 'Skandia Pensiones y Cesantías S.A.',
  tag: 'Skandia Capital + Seguros',
  saldoTotal: '$52.732.191',
  saldoRetiro: '$52.732.191',
  capital: '$47.483.281',
  rendimientos: '$5.248.910',
  beneficio: { saldoSinPerder: '$0', acumulado: '$0', devuelto: '$0' },
  creditoPreaprobado: '$13.000.000',
};
