// Listados de ejemplo del panel lateral "de la cifra al listado de clientes" (datos ficticios).
import { DefLista, FilaLista } from '@features/radiografia/interfaces/lista';
import { ClaveLista, Gestion } from '@features/radiografia/interfaces/radiografia';

type Listas = Readonly<Partial<Record<ClaveLista, DefLista>>>;

const f = (gestion: Gestion, ...celdas: string[]): FilaLista => ({ gestion, celdas });

/** Empresa ABC S.A. (con PAC): el director ve todos los clientes; el FP Asignado, solo los suyos. */
export const LISTAS_CON_PAC: Listas = {
  clientes: {
    titulo: 'Clientes de Skandia en la empresa',
    sub: 'Empleados de la empresa con productos en Skandia y el asesor que los atiende.',
    total: 412,
    dueno: 171,
    agencia: 30,
    otras: 211,
    todosDirector: true,
    cols: ['Cliente', 'Atendido por', 'Productos', 'Segmento', 'Edad', 'Saldo'],
    filas: [
      f('dueno', 'Ricardo Salazar Lima', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Elite', '52', '$148.000.000'),
      f('dueno', 'Juliana Restrepo Mora', 'Juan Alberto Rodríguez', 'Plan corporativo y voluntaria', 'Privilegio', '45', '$96.400.000'),
      f('otras', 'Hernán Darío Ospina', 'Marcela Duarte Gil · Agencia Sur', 'Obligatoria y voluntaria', 'Privilegio', '49', '$88.300.000'),
      f('dueno', 'Andrés Felipe Gómez', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Privilegio', '41', '$62.900.000'),
      f('agencia', 'Jorge Iván Castro', 'Felipe Arango Mejía', 'Pensión voluntaria', 'Privilegio', '45', '$57.200.000'),
      f('dueno', 'Camila Ortiz Prieto', 'Juan Alberto Rodríguez', 'Plan corporativo, obligatoria y cesantías', 'Finanzas Personales', '39', '$54.700.000'),
      f('otras', 'Sofía Marín Henao', 'Andrés Pardo Lugo · Agencia Centro', 'Pensión obligatoria', 'Finanzas Personales', '33', '$29.600.000'),
      f('agencia', 'Carolina Pérez Silva', 'Felipe Arango Mejía', 'Pensión obligatoria', 'Finanzas Personales', '29', '$24.700.000'),
      f('dueno', 'Paola Andrea Cruz', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Finanzas Personales', '36', '$21.800.000'),
      f('dueno', 'Laura Méndez Ríos', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Finanzas Personales', '34', '$18.400.000'),
    ],
  },
  monoproducto: {
    titulo: 'Clientes monoproducto',
    sub: 'Clientes de la empresa con un solo producto en Skandia. Son la vía rápida para el segundo producto.',
    total: 239,
    dueno: 92,
    agencia: 17,
    otras: 130,
    cols: ['Cliente', 'Atendido por', 'Producto que tiene', 'Segmento', 'Edad', 'Saldo'],
    filas: [
      f('dueno', 'Laura Méndez Ríos', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Finanzas Personales', '34', '$18.400.000'),
      f('dueno', 'Andrés Felipe Gómez', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Privilegio', '41', '$62.900.000'),
      f('agencia', 'Carolina Pérez Silva', 'Felipe Arango Mejía', 'Pensión obligatoria', 'Finanzas Personales', '29', '$24.700.000'),
      f('dueno', 'Mauricio Torres Vela', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Finanzas Personales', '38', '$12.100.000'),
      f('agencia', 'Natalia Ruiz Ortega', 'Diana Cortés Rojas', 'Cesantías', 'Finanzas Personales', '27', '$6.300.000'),
      f('dueno', 'Ricardo Salazar Lima', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Elite', '52', '$148.000.000'),
      f('dueno', 'Paola Andrea Cruz', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Finanzas Personales', '36', '$21.800.000'),
      f('agencia', 'Jorge Iván Castro', 'Felipe Arango Mejía', 'Pensión voluntaria', 'Privilegio', '45', '$57.200.000'),
    ],
  },
  perdidos: {
    titulo: 'Clientes perdidos en 2026',
    sub: 'Clientes que retiraron todo su saldo o salieron de la empresa entre enero y octubre de 2026.',
    total: 11,
    dueno: 2,
    agencia: 1,
    otras: 8,
    cols: ['Cliente', 'Atendido por', 'Producto que tenía', 'Motivo', 'Fecha', 'Saldo retirado'],
    filas: [
      f('dueno', 'Sandra Milena López', 'Juan Alberto Rodríguez', 'Plan corporativo', 'Salió de la empresa', 'Mar 2026', '$34.500.000'),
      f('dueno', 'Camilo Herrera Paz', 'Juan Alberto Rodríguez', 'Pensión voluntaria', 'Retiro total', 'Jun 2026', '$15.200.000'),
      f('agencia', 'Valentina Ortiz Gil', 'Diana Cortés Rojas', 'Cesantías', 'Retiro total', 'Ago 2026', '$4.900.000'),
    ],
  },
};

/** Empresa ABC S.A., vista del asesor (otro FP): solo sus clientes en la empresa. */
export const LISTAS_CON_PAC_FP: Listas = {
  clientes: {
    titulo: 'Clientes en esta empresa',
    sub: 'Tus clientes que trabajan en Empresa ABC S.A. y sus productos contigo.',
    total: 2,
    dueno: 2,
    agencia: 0,
    otras: 0,
    cols: ['Cliente', 'Productos', 'Segmento', 'Edad', 'Saldo'],
    filas: [
      f('dueno', 'Mariana Quintero Díaz', 'Cesantías', 'Finanzas Personales', '31', '$8.200.000'),
      f('dueno', 'Óscar Iván Pardo', 'Pensión obligatoria y voluntaria', 'Privilegio', '44', '$134.300.000'),
    ],
  },
  monoproducto: {
    titulo: 'Clientes monoproducto',
    sub: 'Tus clientes de esta empresa con un solo producto. Son la vía más rápida al segundo producto.',
    total: 1,
    dueno: 1,
    agencia: 0,
    otras: 0,
    cols: ['Cliente', 'Producto que tiene', 'Segmento', 'Edad', 'Saldo'],
    filas: [f('dueno', 'Mariana Quintero Díaz', 'Cesantías', 'Finanzas Personales', '31', '$8.200.000')],
  },
  perdidos: {
    titulo: 'Clientes perdidos en 2026',
    sub: 'Tus clientes que retiraron todo su saldo o salieron de la empresa entre enero y octubre de 2026.',
    total: 1,
    dueno: 1,
    agencia: 0,
    otras: 0,
    cols: ['Cliente', 'Producto que tenía', 'Motivo', 'Fecha', 'Saldo retirado'],
    filas: [f('dueno', 'Carolina Beltrán Ruiz', 'Cesantías', 'Salió de la empresa', 'Jul 2026', '$3.900.000')],
  },
};

/** Empresa XYZ S.A.S. (sin PAC, vista director): detalle solo de los clientes de su agencia. */
export const LISTAS_SIN_PAC: Listas = {
  clientes: {
    titulo: 'Clientes de Skandia en la empresa',
    sub: 'Empleados de la empresa con productos en Skandia. Ves el detalle de los clientes de tu agencia.',
    total: 11,
    dueno: 0,
    agencia: 7,
    otras: 4,
    cols: ['Cliente', 'Atendido por', 'Productos', 'Segmento', 'Edad', 'Saldo'],
    filas: [
      f('agencia', 'Paola Andrea Cruz', 'Felipe Arango Mejía', 'Obligatoria, voluntaria y fiduciaria', 'Elite', '52', '$216.100.000'),
      f('agencia', 'Andrés Felipe Gómez', 'Felipe Arango Mejía', 'Obligatoria y voluntaria', 'Privilegio', '41', '$120.000.000'),
      f('agencia', 'Laura Méndez Ríos', 'Felipe Arango Mejía', 'Pensión obligatoria', 'Finanzas Personales', '34', '$62.400.000'),
      f('agencia', 'Mauricio Torres Vela', 'Felipe Arango Mejía', 'Pensión obligatoria', 'Finanzas Personales', '28', '$31.500.000'),
      f('agencia', 'Jorge Iván Castro', 'Diana Cortés Rojas', 'Obligatoria y cesantías', 'Privilegio', '58', '$231.100.000'),
      f('agencia', 'Natalia Ruiz Ortega', 'Diana Cortés Rojas', 'Pensión obligatoria', 'Finanzas Personales', '27', '$18.900.000'),
      f('agencia', 'Carlos Andrés Vélez', 'Tú', 'Pensión obligatoria', 'Privilegio', '47', '$80.000.000'),
    ],
  },
  monoproducto: {
    titulo: 'Clientes monoproducto',
    sub: 'Clientes de la empresa con un solo producto en Skandia. Son la vía rápida para el segundo producto.',
    total: 7,
    dueno: 0,
    agencia: 4,
    otras: 3,
    cols: ['Cliente', 'Atendido por', 'Producto que tiene', 'Segmento', 'Edad', 'Saldo'],
    filas: [
      f('agencia', 'Laura Méndez Ríos', 'Felipe Arango Mejía', 'Pensión obligatoria', 'Finanzas Personales', '34', '$62.400.000'),
      f('agencia', 'Mauricio Torres Vela', 'Felipe Arango Mejía', 'Pensión obligatoria', 'Finanzas Personales', '28', '$31.500.000'),
      f('agencia', 'Natalia Ruiz Ortega', 'Diana Cortés Rojas', 'Pensión obligatoria', 'Finanzas Personales', '27', '$18.900.000'),
      f('agencia', 'Carlos Andrés Vélez', 'Tú', 'Pensión obligatoria', 'Privilegio', '47', '$80.000.000'),
    ],
  },
  perdidos: {
    titulo: 'Clientes perdidos en 2026',
    sub: 'Clientes que retiraron todo su saldo o salieron de la empresa entre enero y octubre de 2026.',
    total: 2,
    dueno: 0,
    agencia: 1,
    otras: 1,
    cols: ['Cliente', 'Atendido por', 'Producto que tenía', 'Motivo', 'Fecha', 'Saldo retirado'],
    filas: [f('agencia', 'Valentina Ortiz Gil', 'Diana Cortés Rojas', 'Pensión obligatoria', 'Salió de la empresa', 'Ago 2026', '$14.200.000')],
  },
};
