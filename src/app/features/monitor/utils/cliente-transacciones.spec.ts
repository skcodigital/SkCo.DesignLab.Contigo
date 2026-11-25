import { PORTAFOLIOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR } from '@features/monitor/data/cliente.mock';
import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import {
  opcionesGraficaTransacciones,
  seriesTransacciones,
  tendencia,
  tooltipTransacciones,
} from '@features/monitor/utils/cliente-grafica-transacciones';
import { clavePortafolio, filasPortafolios } from '@features/monitor/utils/cliente-portafolios';
import {
  COLUMNAS_TRANSACCIONES,
  filasTransacciones,
  hayDevoluciones,
  opcionesTablaTransacciones,
  tooltipContrato,
} from '@features/monitor/utils/cliente-transacciones';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

const YTD = { inicio: '2026-01-01', fin: '2026-11-12' };
const FIC = PORTAFOLIOS_OSCAR[6];
const fila = (clave: string) =>
  filasPortafolios(PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR, COLORES_GRAFICA.cliente).find((f) => f.clave === clave)!;

describe('cliente-transacciones', () => {
  it('lista los movimientos del periodo del más reciente al más antiguo', () => {
    const filas = filasTransacciones(FIC, YTD, HOY_MONITOR, false);
    expect(filas.length).toBe(15);
    expect(filas[0]).toMatchObject({ fecha: '2026-11-05T00:00:00', tipo: 'Adición', total: 500_000, contrato: '301000052847' });
    expect(filas.at(-1)?.fecha).toBe('2026-01-13T00:00:00');
    expect(filas[0].unidades).toBeCloseTo(500_000 / filas[0].valorUnidad, 3);
  });

  it('«Ocultar devoluciones» quita los ajustes y solo aparece si los hay', () => {
    expect(hayDevoluciones(FIC, YTD)).toBe(true);
    expect(filasTransacciones(FIC, YTD, HOY_MONITOR, true).length).toBe(14);
    expect(hayDevoluciones(PORTAFOLIOS_OSCAR[4], YTD)).toBe(false);
  });

  it('el contrato lleva su meta y su producto en el tooltip', () => {
    expect(tooltipContrato('301000052847', PRODUCTOS_CONTRATO_OSCAR)).toBe(
      'Viaje |  Fondo De Inversión Colectiva Skandia Efectivo - 301000052847',
    );
    expect(tooltipContrato('999', PRODUCTOS_CONTRATO_OSCAR)).toBe('');
    const o = opcionesTablaTransacciones([], COLUMNAS_TRANSACCIONES, PRODUCTOS_CONTRATO_OSCAR);
    expect(o.etiquetas).toEqual(['Fecha', 'Contrato', 'No. Unidades', 'Tipo transacción', 'Valor unidad', 'Total']);
    expect(o.ordenable).toBe(true);
  });

  it('arma la gráfica: barras en millones, aportes y retiros, tendencia y promedios', () => {
    const f = fila(clavePortafolio(FIC));
    const series = seriesTransacciones(FIC, f, YTD, HOY_MONITOR, false);
    expect(series.map((s) => s.name)).toEqual([
      'Valor - 301000052847',
      'FIC Skandia Efectivo',
      'Retiro - 301000052847',
      'Aporte - 301000052847',
      'Línea de Tendencia Sup',
      'Línea de Tendencia Inf',
      'Valor promedio de compra',
      'Valor promedio de venta',
    ]);
    expect(series[0].data[0]).toEqual(['13 ene 26', '5.00']);
    const ocultas = seriesTransacciones(FIC, f, YTD, HOY_MONITOR, true);
    expect(ocultas[0].data.filter(([, y]) => y === null).length).toBe(1);
    expect(seriesTransacciones(FIC, f, { inicio: '2025-01-01', fin: '2025-12-31' }, HOY_MONITOR, false)).toEqual([]);

    const opciones = opcionesGraficaTransacciones(series, false, () => undefined) as { xAxis: { data: string[] }[] };
    expect(opciones.xAxis[0].data[0]).toBe('13 ene 26');
    expect(opciones.xAxis[0].data.at(-1)).toBe('12 nov 26');
  });

  it('el tooltip muestra los valores reales y omite la tendencia', () => {
    const f = fila(clavePortafolio(FIC));
    const series = seriesTransacciones(FIC, f, YTD, HOY_MONITOR, false);
    const html = tooltipTransacciones(
      [
        { seriesName: 'FIC Skandia Efectivo', dataIndex: 0, marker: '•', value: ['1 ene 26', '1000.00'] },
        { seriesName: 'Línea de Tendencia Sup', dataIndex: 0, marker: '•', value: ['1 ene 26', '1'] },
        { seriesName: 'Valor promedio de venta', dataIndex: 0, marker: '•', value: ['1 ene 26', '1'] },
      ],
      series,
    );
    expect(html).toContain('<b>1 ene 26</b>');
    expect(html).toContain('FIC Skandia Efectivo: <b>');
    expect(html).not.toContain('Tendencia');
    expect(html).toContain('Valor promedio de venta:');
    expect(html).toContain('Permite identificar si el valor actual');
  });

  it('la recta de tendencia sigue una serie lineal sin desviación', () => {
    expect(tendencia([1, 2, 3])).toEqual({ recta: [1, 2, 3], desviacion: 0 });
    expect(tendencia([])).toEqual({ recta: [], desviacion: 0 });
  });
});
