import { PORTAFOLIOS } from '@features/ficha-cliente/data/composicion.mock';
import { PRODUCTOS } from '@features/ficha-cliente/data/productos.mock';
import { Fondo } from '@features/ficha-cliente/interfaces/composicion';
import {
  ActivoDetalle,
  ContratoGrafica,
  DefinicionContrato,
  DefinicionSerie,
} from '@features/monitor/interfaces/detalle';
import {
  HOY_MONITOR,
  MEZCLAS,
  REFERENCIAS_COMPARABLES,
  detalleMezcla,
} from '@features/monitor/data/detalle-catalogos.mock';
import { contratosEnRango } from '@features/monitor/utils/detalle-contratos';
import { periodosDesempeno } from '@features/monitor/utils/detalle-series';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';
import { PERIODO, rangoPorPeriodo } from '@features/monitor/utils/periodos';

/**
 * Monitor del cliente: los dos contratos de Óscar de la ficha (Multifund 100000063061 y FIC Efectivo
 * 301000052847) con el valor de unidad en el tiempo. Hoy, unidades × valor de unidad da el saldo de la ficha y
 * los rendimientos son los de la ficha; hacia atrás la serie es determinista.
 */

const suma = (fondos: readonly Fondo[], campo: 'unidades' | 'saldo' | 'rendimientos'): number =>
  fondos.reduce((total, f) => total + f[campo], 0);

function contrato(
  tipo: 'mf' | 'fic',
  producto: string,
  serie: Omit<DefinicionSerie, 'valorHoy' | 'decimales'>,
): DefinicionContrato {
  const fondos = PORTAFOLIOS[tipo];
  const unidades = suma(fondos, 'unidades');
  return {
    contrato: PRODUCTOS[tipo].contrato,
    producto,
    nombreProducto: PRODUCTOS[tipo].fondo,
    unidades,
    rendimientosHoy: suma(fondos, 'rendimientos'),
    // Valor de unidad del contrato: saldo de hoy entre las unidades (6 decimales para que el saldo cuadre).
    serie: { ...serie, valorHoy: suma(fondos, 'saldo') / unidades, decimales: 6 },
  };
}

/** Contratos de Óscar (saldo hoy: $52.732.191 y $8.415.300). */
export const CONTRATOS_OSCAR: readonly DefinicionContrato[] = [
  contrato('mf', 'MULTIFUND', { semilla: 1.3, rentabilidadAnual: 11.24, volatilidad: 0.6, inicio: '2025-11-12' }),
  contrato('fic', 'EFECTIVO', { semilla: 2.7, rentabilidadAnual: 9.12, volatilidad: 0.4, inicio: '2026-01-13' }),
];

/** Contratos del último año listos para `nc-mon-grafica-contratos` («Multifund 061» y «Efectivo 847»). */
export const CONTRATOS_GRAFICA_EJEMPLO: readonly ContratoGrafica[] = contratosEnRango(
  CONTRATOS_OSCAR,
  rangoPorPeriodo(PERIODO.ultimoAnio, HOY_MONITOR),
  HOY_MONITOR,
  COLORES_GRAFICA.cliente,
);

/** Detalle de cada portafolio de Óscar (valor de unidad y rentabilidad E.A. de la ficha). */
export const DETALLES_PORTAFOLIOS_OSCAR: readonly ActivoDetalle[] = [...PORTAFOLIOS.mf, ...PORTAFOLIOS.fic].map(
  (f, i) => ({
    id: `OSCAR-${i + 1}`,
    tipo: 'portafolio' as const,
    nombre: f.nombre,
    desempeno: periodosDesempeno(
      { semilla: 0.5 + i * 0.8, valorHoy: f.valorUnidad, rentabilidadAnual: f.ea, volatilidad: 0.6 + (i % 3) * 0.4 },
      HOY_MONITOR,
    ),
    documentos: [
      { tipo: 'ficha-tecnica', fechaCorte: '2026-10-31' },
      { tipo: 'informe-mensual', fechaCorte: '2026-10-31' },
      { tipo: 'prospecto', fechaCorte: '2025-02-14' },
    ],
  }),
);

/** Detalle de ejemplo de una mezcla agregada con «Comparar» (en el cliente se abre sin la TIR). */
export const DETALLE_MEZCLA_CLIENTE: ActivoDetalle = detalleMezcla(MEZCLAS.find((m) => m.nombre === 'PACIENTE') ?? MEZCLAS[0]);

/** Detalle de ejemplo de un portafolio de la competencia (con el logo de la compañía en el título). */
export const DETALLE_REFERENCIA_CLIENTE: ActivoDetalle = REFERENCIAS_COMPARABLES[0].detalle as ActivoDetalle;
