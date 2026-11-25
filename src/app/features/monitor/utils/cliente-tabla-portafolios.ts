import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { FilaPortafolio } from '@features/monitor/interfaces/cliente';
import { Estilos, GrupoCasillas, OpcionesTabla, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import { AJUSTADA, SIN_FONDO, textoCelda } from '@features/monitor/utils/cliente-tablas';

/**
 * «Indicadores por portafolio» de la página del Monitor del cliente (`TABLE_PORTFOLIO_OPTIONS`): columnas de
 * posición (fondo azul) y de rentabilidad del periodo (fondo verde), transacciones en una píldora y «Descargar
 * informe» al inicio de cada fila.
 */

const C = TEXTOS_CLIENTE.columnas;
const A = TEXTOS_CLIENTE.ayudasPortafolios;

/** Columnas de posición (foto actual del cliente) y de rentabilidad (según el periodo). */
const POSICION = ['fechaPrimeraCompra', 'vupCompra', 'vupVenta', 'valorUnidad', 'saldo', 'rendimientoAcumulado', 'contribucionAcumulado'] as const;
const RENTABILIDAD = ['rendimientoPeriodo', 'contribucionPeriodo', 'retorno', 'tea', 'tir', 'transacciones'] as const;

const AZUL: Estilos = { 'background-color': 'var(--sk-color-info-light)' };
const VERDE: Estilos = { 'background-color': '#ecfdf3' };
const PILDORA_VALOR: Estilos = {
  'background-color': 'var(--sk-color-surface)',
  'border-radius': '12px',
  padding: '2px 8px',
  display: 'inline-block',
};

const porClave = (claves: readonly string[], estilo: Estilos): Record<string, Estilos> =>
  Object.fromEntries(claves.map((c) => [c, estilo]));

/** Casillas de «Personaliza» (sin el nombre, que siempre se ve). */
export const CASILLAS_PORTAFOLIOS: GrupoCasillas = {
  titulo: C.personaliza,
  opciones: [
    { valor: 'porcentaje', nombre: C.porcentajeOpcion },
    { valor: 'fechaPrimeraCompra', nombre: C.fechaPrimeraCompra },
    { valor: 'vupCompra', nombre: C.vupCompra },
    { valor: 'vupVenta', nombre: C.vupVenta },
    { valor: 'valorUnidad', nombre: C.valorUnidadActual },
    { valor: 'saldo', nombre: C.saldoActual },
    { valor: 'rendimientoAcumulado', nombre: C.rendimientoAcumulado },
    { valor: 'contribucionAcumulado', nombre: C.contribucionAcumulado },
    { valor: 'rendimientoPeriodo', nombre: C.rendimientoPeriodo },
    { valor: 'contribucionPeriodo', nombre: C.contribucionPeriodo },
    { valor: 'retorno', nombre: C.retorno },
    { valor: 'tea', nombre: C.tea },
    { valor: 'tir', nombre: C.tir },
    { valor: 'transacciones', nombre: C.transacciones },
  ],
};

/** Columnas visibles por defecto. */
export const COLUMNAS_PORTAFOLIOS: ValoresCasillas = Object.fromEntries(
  ['porcentaje', 'nombre', ...POSICION, ...RENTABILIDAD].map((c) => [c, true]),
);

/** `YYYY-MM-DD` → `DD/MM/YYYY`. */
function fechaVisible(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

/** Opciones de «Indicadores por portafolio». */
export function opcionesTablaPortafolios(filas: readonly FilaPortafolio[], columnas: ValoresCasillas | null): OpcionesTabla {
  return {
    claves: ['porcentaje', 'nombre', ...POSICION, ...RENTABILIDAD],
    etiquetas: [
      C.portafolios,
      'nombre',
      C.fechaPrimeraCompra,
      C.vupCompra,
      C.vupVenta,
      C.valorUnidadActual,
      C.saldoActual,
      C.rendimientoAcumulado,
      C.contribucionAcumulado,
      C.rendimientoPeriodo,
      C.contribucionPeriodo,
      C.retorno,
      C.tea,
      C.tir,
      C.transacciones,
    ],
    encabezadosOcultos: ['porcentaje', 'nombre'],
    tiposColumna: [
      'porcentaje',
      'accion',
      'texto',
      'dinero',
      'dinero',
      'dinero',
      'dinero',
      'dinero',
      'porcentaje',
      'dinero',
      'porcentaje',
      'porcentaje',
      'porcentaje',
      'porcentaje',
      'accion',
    ],
    datos: filas,
    coloresPunto: filas.map((f) => f.color),
    ordenable: true,
    conAcciones: false,
    conPaginador: false,
    altoMaximo: 520,
    ocultarAccionesPredeterminadas: { analizarConSami: true, copiar: false, personalizar: true, graficar: true },
    columnasVisibles: columnas ?? COLUMNAS_PORTAFOLIOS,
    conAccionesFila: true,
    posicionAccionesFila: 'inicio',
    accionesFila: [{ clave: 'descargar', nombre: TEXTOS_CLIENTE.descargarInforme, icono: 'descargar' }],
    mostrarColumnaIndice: true,
    tipoColumnaIndice: 'punto',
    alineaciones: ['end', 'start', ...Array<'center'>(13).fill('center')],
    estiloColumna: {
      porcentaje: textoCelda('700'),
      nombre: textoCelda('400'),
      point: AJUSTADA,
      'row-actions': AJUSTADA,
      ...porClave([...POSICION, ...RENTABILIDAD.slice(0, -1)], SIN_FONDO),
      // Píldora del ícono de transacciones: ancho fijo para que no cambie con los dígitos.
      transacciones: {
        'background-color': '#ecfdf3',
        border: '1px solid var(--sk-color-primary)',
        'border-radius': '20px',
        padding: '2px 8px',
        'min-width': '58px',
        'max-width': '58px',
        margin: '0 auto',
        gap: '4px',
        position: 'relative',
        'justify-content': 'center',
      },
    },
    estiloEncabezado: {
      ...porClave(POSICION, AZUL),
      rendimientoAcumulado: { ...AZUL, color: 'var(--sk-color-info)' },
      contribucionAcumulado: { ...AZUL, color: 'var(--sk-color-info)' },
      ...porClave(RENTABILIDAD, VERDE),
    },
    estiloCelda: { ...porClave(POSICION, AZUL), ...porClave(RENTABILIDAD, VERDE) },
    estiloValor: porClave(['retorno', 'tea', 'tir'], PILDORA_VALOR),
    estiloContenedorIcono: { transacciones: { display: 'inline-flex', 'align-items': 'center', 'line-height': '1' } },
    estiloIcono: {
      transacciones: {
        color: 'var(--sk-color-primary)',
        'font-size': '12px',
        'line-height': '1',
        display: 'flex',
        'align-items': 'center',
      },
    },
    iconosColumna: (f) => [...Array<null>(14).fill(null), f['transacciones'] ? { icono: 'recibo' } : null],
    posicionIconosColumna: () => [...Array<''>(14).fill(''), 'inicio'],
    tooltipCelda: (_f, clave) => (clave === 'nombre' ? TEXTOS_CLIENTE.verMas : ''),
    formatoCelda: (_f, clave, valor) =>
      clave === 'fechaPrimeraCompra' && typeof valor === 'string' && valor ? fechaVisible(valor) : null,
    tooltipsEncabezado: [
      '',
      '',
      A.fechaPrimeraCompra,
      A.vupCompra,
      A.vupVenta,
      A.valorUnidad,
      A.saldo,
      A.rendimientoAcumulado,
      A.contribucionAcumulado,
      A.rendimientoPeriodo,
      A.contribucionPeriodo,
      A.retorno,
      A.tea,
      A.tir,
      A.transacciones,
    ],
  };
}
