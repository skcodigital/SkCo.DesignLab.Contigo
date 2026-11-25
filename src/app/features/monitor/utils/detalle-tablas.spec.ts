import { HOY_MONITOR, MEZCLAS_COMPARABLES } from '@features/monitor/data/detalle-catalogos.mock';
import { PeriodoDesempeno } from '@features/monitor/interfaces/detalle';
import {
  COLUMNAS_TENDENCIA,
  flechaPorValor,
  iconoFlecha,
  opcionesTablaDesempeno,
  opcionesTablaTendencia,
} from '@features/monitor/utils/detalle-tablas';
import { porcionesComposicion, tendenciaEnRango, vistaTendenciaActivo } from '@features/monitor/utils/detalle-tendencia';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

const PERIODO: PeriodoDesempeno = { periodo: '30 días', variacion: 1.2, volatilidad: -0.4, tir: null, tea: 9.1, retorno: 0 };

describe('detalle-tablas', () => {
  it('flechas por signo; el exterior las achica a 10px', () => {
    expect(flechaPorValor(0, 'cliente')).toBeNull();
    expect(flechaPorValor(null, 'cliente')).toBeNull();
    expect(flechaPorValor(2, 'cliente')).toEqual({ icono: 'flecha-sube', color: 'var(--sk-color-primary)' });
    expect(iconoFlecha(false, 'exterior')).toEqual({ icono: 'flecha-baja', color: '#e03430', tamano: 10 });
  });

  it('la tabla de desempeño muestra la TIR solo cuando se pide', () => {
    const conTir = opcionesTablaDesempeno([PERIODO], true, 'cliente');
    expect(conTir.claves).toEqual(['periodo', 'variacion', 'volatilidad', 'tir', 'tea', 'retorno']);
    expect(opcionesTablaDesempeno([PERIODO], false, 'exterior').etiquetas).toEqual([
      'Periodo',
      'Variación',
      'Volatilidad',
      'TEA',
      'Retorno',
    ]);
    expect(conTir.formatoCelda?.({}, 'tir', null)).toBe('-');
    expect(conTir.formatoCelda?.({}, 'tea', 9.1)).toBeNull();
    const iconos = conTir.iconosColumna?.({ ...PERIODO }) ?? [];
    expect(iconos.map((i) => (i && 'icono' in i ? i.icono : null))).toEqual([
      null,
      'flecha-sube',
      'flecha-baja',
      null,
      'flecha-sube',
      null,
    ]);
  });

  it('la tabla de tendencia oculta los encabezados de % y nombre', () => {
    const o = opcionesTablaTendencia([{ color: '#a00' }], COLUMNAS_TENDENCIA, 'cliente');
    expect(o.claves.length).toBe(8);
    expect(o.encabezadosOcultos).toEqual(['porcentaje', 'nombre']);
    expect(o.coloresPunto).toEqual(['#a00']);
    expect(o.tooltipsIconosEncabezado?.[0]).toBe('');
  });
});

describe('detalle-tendencia', () => {
  const tendencia = MEZCLAS_COMPARABLES.find((m) => m.clave === 'PACIENTE')?.detalle?.tendencia;

  it('ordena la composición y conserva el color de llegada', () => {
    const porciones = porcionesComposicion(
      [
        { nombre: 'A', porcentaje: 10 },
        { nombre: 'B', porcentaje: 60 },
      ],
      COLORES_GRAFICA.cliente,
    );
    expect(porciones).toEqual([
      { nombre: 'B', valor: 60, color: '#A4D7E1' },
      { nombre: 'A', valor: 10, color: '#A1DD70' },
    ]);
  });

  it('arma torta, líneas y tabla de una mezcla para el rango', () => {
    expect(tendencia).toBeDefined();
    if (!tendencia) {
      return;
    }
    const v = tendenciaEnRango(tendencia, { inicio: '2026-10-12', fin: '2026-11-12' }, HOY_MONITOR, COLORES_GRAFICA.exterior);
    expect(v.composicion[0].nombre).toBe('Renta Fija Colombia');
    expect(v.series.length).toBe(5);
    expect(v.etiquetas.length).toBe(32);
    expect(v.series[0].datos[0]).toBe(1000);
    expect(v.filas.map((f) => f['nombre'])).toEqual(v.composicion.map((c) => c.nombre));
    expect(v.filas[0]['color']).toBe(v.composicion[0].color);
    expect(v.yMax).toBeGreaterThanOrEqual(v.yMin);
  });

  it('arma la tendencia de un activo con líneas sin suavizar', () => {
    const v = vistaTendenciaActivo(
      { categorias: [{ nombre: 'Liquidez', porcentaje: 100 }], etiquetas: ['Ene'], series: [{ nombre: 'X', datos: [1000] }] },
      COLORES_GRAFICA.cliente,
    );
    expect(v.series[0].suave).toBe(false);
    expect(v.yMin).toBe(1000);
  });
});
