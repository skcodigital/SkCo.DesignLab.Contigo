import { COMISIONES_POR_MES, DISTRIBUCION_CLIENTES, INDICADORES_BASE } from '../data/logros.mock';
import {
  anguloDesdeCentro,
  desfaseMeses,
  esMesFuturo,
  gradienteConico,
  indicadoresDelMes,
  polilinea,
  puntoMedioSegmento,
  puntosComisiones,
  segmentoDeAngulo,
  siguienteHabilitado,
  ultimoMesCerrado,
} from './logros';

describe('meses de Logros', () => {
  it('el último mes cerrado es el anterior a hoy (y cruza de año en enero)', () => {
    expect(ultimoMesCerrado(new Date(2026, 10, 13))).toEqual({ anio: 2026, mes: 9 });
    expect(ultimoMesCerrado(new Date(2027, 0, 5))).toEqual({ anio: 2026, mes: 11 });
  });

  it('los meses que no han cerrado están deshabilitados', () => {
    const ultimo = { anio: 2026, mes: 9 };
    expect(esMesFuturo(2026, 9, ultimo)).toBe(false);
    expect(esMesFuturo(2026, 10, ultimo)).toBe(true);
    expect(esMesFuturo(2027, 0, ultimo)).toBe(true);
    expect(esMesFuturo(2025, 11, ultimo)).toBe(false);
  });

  it('calcula el desfase en meses respecto al último cerrado', () => {
    expect(desfaseMeses({ anio: 2026, mes: 9 }, { anio: 2026, mes: 9 })).toBe(0);
    expect(desfaseMeses({ anio: 2025, mes: 10 }, { anio: 2026, mes: 9 })).toBe(-11);
  });

  it('la grilla salta los meses deshabilitados y no se sale de los bordes', () => {
    const des = [false, false, false, false, false, false, false, false, false, false, true, true];
    expect(siguienteHabilitado(9, 1, des)).toBe(-1);
    expect(siguienteHabilitado(5, 4, des)).toBe(9);
    expect(siguienteHabilitado(6, 4, [...des.slice(0, 11), false])).toBe(11);
    expect(siguienteHabilitado(2, -4, des)).toBe(-1);
    expect(siguienteHabilitado(4, -1, des)).toBe(3);
  });
});

describe('indicadoresDelMes', () => {
  it('sin asesor y en el último mes conserva la variación base', () => {
    const r = indicadoresDelMes(INDICADORES_BASE, 0, null);
    expect(r.map((x) => x.variacion)).toEqual([-1, 2, 1, 1]);
    expect(r[0].valor).toBe(40000000);
  });

  it('redondea a cien mil y da variaciones enteras', () => {
    for (const k of [-13, -1, 0]) {
      for (const asesor of [null, 0, 4]) {
        indicadoresDelMes(INDICADORES_BASE, k, asesor).forEach((x) => {
          expect(x.valor % 100000).toBe(0);
          expect(Number.isInteger(x.variacion)).toBe(true);
        });
      }
    }
  });

  it('un asesor ve una fracción de los valores totales', () => {
    const todos = indicadoresDelMes(INDICADORES_BASE, -2, null);
    const uno = indicadoresDelMes(INDICADORES_BASE, -2, 1);
    uno.forEach((x, i) => expect(x.valor).toBeLessThan(todos[i].valor));
  });
});

describe('gráfica de comisiones', () => {
  it('ubica los puntos como el prototipo (x en el viewBox, left/top en %)', () => {
    const p = puntosComisiones(COMISIONES_POR_MES);
    expect(p[0].x).toBeCloseTo(16.667, 2);
    expect(p[0].left).toBeCloseTo(4.167, 2);
    expect(p[0].top).toBe(39.2);
    expect(p[11].top).toBe(8.6);
    expect(p[9].top).toBe(75.2);
  });

  it('arma la polilínea con un decimal', () => {
    expect(polilinea(puntosComisiones(COMISIONES_POR_MES))).toBe(
      '16.7,47.0 50.0,57.8 83.3,51.4 116.7,44.9 150.0,46.0 183.3,47.0 216.7,49.2 250.0,51.4 283.3,55.7 316.7,90.2 350.0,73.0 383.3,10.3',
    );
  });
});

describe('dona de distribución', () => {
  const pcts = DISTRIBUCION_CLIENTES.map((s) => s.porcentaje);

  it('arma el conic-gradient acumulando porcentajes', () => {
    expect(gradienteConico(DISTRIBUCION_CLIENTES)).toBe(
      'conic-gradient(#0099DE 0% 82%,#1DD64C 82% 97%,#4AE6C3 97% 100%)',
    );
  });

  it('mide el ángulo en sentido horario desde las 12', () => {
    expect(anguloDesdeCentro(0, -10)).toBeCloseTo(0);
    expect(anguloDesdeCentro(10, 0)).toBeCloseTo(90);
    expect(anguloDesdeCentro(0, 10)).toBeCloseTo(180);
    expect(anguloDesdeCentro(-10, 0)).toBeCloseTo(270);
  });

  it('elige el segmento por ángulo', () => {
    expect(segmentoDeAngulo(10, pcts)).toBe(0);
    expect(segmentoDeAngulo(300, pcts)).toBe(1); // 83 %
    expect(segmentoDeAngulo(355, pcts)).toBe(2); // 98.6 %
    expect(segmentoDeAngulo(360, pcts)).toBe(2);
  });

  it('el punto medio del segmento cae sobre el anillo', () => {
    const { x, y } = puntoMedioSegmento(0, pcts);
    expect(Math.hypot(x - 56, y - 56)).toBeCloseTo(46);
  });
});
