import { RUTAS } from '@core/constants/rutas';

export enum TipoResultado {
  Cliente = 'cliente',
  Empresa = 'empresa',
}

export interface ResultadoBusqueda {
  id: string;
  tipo: TipoResultado;
  titulo: string;
  detalle: string;
  /** Texto adicional por el que también se encuentra (ID, celular, correo, contrato, NIT…). */
  claves: string;
  ruta: string;
}

/** «Elementos recientes» del buscador (los únicos navegables en el prototipo). */
export const RECIENTES: readonly ResultadoBusqueda[] = [
  {
    id: 'oscar',
    tipo: TipoResultado.Cliente,
    titulo: 'Óscar Camilo Hernández Ramírez',
    detalle: 'CC. 111111111',
    claves: 'oscar camilo hernandez ramirez 111111111 3044444444 oschernandez@gmail.com 100000063061',
    ruta: `/${RUTAS.ficha}`,
  },
  {
    id: 'empresa-abc',
    tipo: TipoResultado.Empresa,
    titulo: 'Empresa ABC S.A.',
    detalle: 'NIT. 900.456.789-1 · 1.250 empleados',
    claves: 'abc s.a. sa empresa 900456789 9004567891',
    ruta: `/${RUTAS.radiografia}`,
  },
];
