import { EstadoSaldos, FilaComposicion, FilaTablaComposicion, Fondo } from '../interfaces/composicion';
import { TipoProducto } from '../interfaces/productos';
import { TEXTOS_FICHA } from '../constants/textos';
import { diasEntre, formatoFechaLarga } from './fechas';
import { formatoDecimal, formatoPesos } from './montos';

const T = TEXTOS_FICHA.composicion;

/**
 * Recalcula los portafolios a una fecha de corte (datos de ejemplo del prototipo): descuenta el
 * rendimiento E.A. por los días transcurridos, ajusta rendimientos y hace oscilar la E.A. histórica.
 * La participación de cada portafolio va sin redondear (se muestra con dos decimales).
 */
export function calcularComposicion(fondos: readonly Fondo[], hoy: Date, fecha: Date): FilaComposicion[] {
  const dias = diasEntre(fecha, hoy);
  const recalculados = fondos.map((f, i) => {
    const factor = Math.pow(1 + f.ea / 100, -dias / 365);
    const saldo = f.saldo * factor;
    return {
      ...f,
      saldo,
      valorUnidad: f.valorUnidad * factor,
      rendimientos: Math.max(0, f.rendimientos - (f.saldo - saldo)),
      ea: dias === 0 ? f.ea : f.ea + 0.55 * Math.sin(dias / 37 + i * 1.7),
    };
  });
  const total = totalSaldos(recalculados);
  return recalculados.map((f) => ({ ...f, porcentaje: total ? (f.saldo / total) * 100 : 0 }));
}

export function totalSaldos(fondos: readonly Pick<Fondo, 'saldo'>[]): number {
  return fondos.reduce((acc, f) => acc + f.saldo, 0);
}

/** Fondo de la dona: un tramo por portafolio, acumulando las participaciones. */
export function gradienteDona(filas: readonly FilaComposicion[]): string {
  let desde = 0;
  const tramos = filas.map((f) => {
    const hasta = desde + f.porcentaje;
    const tramo = `${f.color} ${desde}% ${hasta}%`;
    desde = hasta;
    return tramo;
  });
  return `conic-gradient(${tramos.join(',')})`;
}

/** "Composición al 12 de noviembre de 2026: 18,07 % FVP Especial CAT 4/02/2030 (no disponible), …" */
export function etiquetaDona(filas: readonly FilaComposicion[], fecha: Date): string {
  return (
    T.donaPrefijo +
    formatoFechaLarga(fecha) +
    ': ' +
    filas
      .map((f) => `${formatoDecimal(f.porcentaje, 2)} % ${f.nombre}${f.disponible ? T.disponible : T.noDisponible}`)
      .join(', ')
  );
}

/** Filas de "Indicadores por portafolio" en formato colombiano. */
export function filasTabla(filas: readonly FilaComposicion[]): FilaTablaComposicion[] {
  return filas.map((f) => ({
    nombre: f.nombre,
    color: f.color,
    participacion: formatoDecimal(f.porcentaje, 2) + ' %',
    unidades: formatoDecimal(f.unidades, 2),
    valorUnidad: '$ ' + formatoDecimal(f.valorUnidad, 2),
    rendimientos: formatoPesos(f.rendimientos),
    ea: formatoDecimal(f.ea, 2) + ' %',
    disponible: f.disponible,
    disponibleTexto: f.disponible ? T.si : T.no,
    saldo: formatoPesos(f.saldo),
  }));
}

/**
 * Tabla copiada al portapapeles: texto separado por tabulaciones que se pega directo en Excel o en un
 * correo. El FIC (un solo portafolio) no lleva fila de total.
 */
export function textoCopiaTabla(datos: {
  readonly tipo: TipoProducto;
  readonly contrato: string;
  readonly estado: EstadoSaldos;
  readonly fechaTexto: string;
  readonly filas: readonly FilaTablaComposicion[];
  readonly total: string;
}): string {
  const estado = datos.estado === 'proceso' ? T.enProceso : T.enEfectivo;
  const lineas = [
    `${T.copiaTitulo}${datos.contrato} · saldos ${estado} al ${datos.fechaTexto}`,
    '',
    T.columnasCopia.join('\t'),
    ...datos.filas.map((f) =>
      [f.nombre, f.participacion, f.unidades, f.valorUnidad, f.rendimientos, f.ea, f.disponibleTexto, f.saldo].join('\t'),
    ),
  ];
  if (datos.tipo !== 'fic') lineas.push([T.total, '100 %', '', '', '', '', '', datos.total].join('\t'));
  return lineas.join('\n');
}

/** Dona de evolución (capital vs. rendimientos). */
export function gradienteRendimientos(pct: number): string {
  return `conic-gradient(var(--sk-charts-c01) 0 ${pct}%,var(--sk-charts-c02) ${pct}% 100%)`;
}

export function etiquetaRendimientos(pct: number): string {
  return `${pct} % rendimientos y ${100 - pct} % capital`;
}
