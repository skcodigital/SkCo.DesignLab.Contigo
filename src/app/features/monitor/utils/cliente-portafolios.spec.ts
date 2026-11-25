import { PORTAFOLIOS } from '@features/ficha-cliente/data/composicion.mock';
import { PORTAFOLIOS_OSCAR } from '@features/monitor/data/cliente.mock';
import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import { ContratoGrafica } from '@features/monitor/interfaces/detalle';
import {
  clavePortafolio,
  coloresSeries,
  contratosPortafolios,
  filasPortafolios,
  filasVisibles,
  filtrarPorProductos,
  gruposFiltro,
  movimientosEnRango,
  promediosCompraVenta,
  recolorearComparacion,
  tortaPortafolios,
} from '@features/monitor/utils/cliente-portafolios';
import { PLAZOS_CDT } from '@features/monitor/data/detalle-catalogos.mock';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

const YTD = { inicio: '2026-01-01', fin: '2026-11-12' };
const INICIO = { inicio: '2025-11-12', fin: '2026-11-12' };
const PALETA = COLORES_GRAFICA.cliente;

describe('cliente-portafolios', () => {
  it('los portafolios de Óscar cuadran con la ficha', () => {
    const ficha = [...PORTAFOLIOS.mf, ...PORTAFOLIOS.fic];
    expect(PORTAFOLIOS_OSCAR.map((p) => p.nombre)).toEqual(ficha.map((f) => f.nombre));
    expect(PORTAFOLIOS_OSCAR.reduce((s, p) => s + p.saldo, 0)).toBe(52_732_191 + 8_415_300);
    expect(clavePortafolio(PORTAFOLIOS_OSCAR[6])).toBe('FICEFECTIVO 847');
  });

  it('ordena por saldo, da el color de la paleta y calcula las medidas del periodo', () => {
    const filas = filasPortafolios(PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR, PALETA);
    expect(filas.map((f) => f.clave)).toEqual([
      'FVPCAT12MD 061',
      'FVPCAT0430 061',
      'FVPCAT0230 061',
      'FVPCAT1127 061',
      'FICEFECTIVO 847',
      'FVPRFMAR29 061',
      'FPVLIQCOL 061',
    ]);
    expect(filas.map((f) => f.color)).toEqual(PALETA.slice(0, 7));
    // Comprado después del 1 de enero: el rendimiento del periodo es el acumulado.
    expect(filas[1].rendimientoPeriodo).toBe(filas[1].rendimientoAcumulado);
    expect(filas[0].transacciones).toBe(5);
    const contribuciones = filas.reduce((s, f) => s + (f.contribucionPeriodo ?? 0), 0);
    expect(Math.round(contribuciones)).toBe(100);
    expect(filas[0].fechaCorte).toBe('2026-11-12');
  });

  it('con «Desde el inicio» el rendimiento del periodo es el de la ficha', () => {
    const filas = filasPortafolios(PORTAFOLIOS_OSCAR, INICIO, HOY_MONITOR, PALETA);
    expect(filas.every((f) => f.rendimientoPeriodo === f.rendimientoAcumulado)).toBe(true);
    const sinDatos = filasPortafolios(PORTAFOLIOS_OSCAR, { inicio: '2025-01-01', fin: '2025-12-31' }, HOY_MONITOR, PALETA);
    const fic = sinDatos.find((f) => f.id === 'FICEFECTIVO');
    expect([fic?.rendimientoPeriodo, fic?.tea, fic?.tir, fic?.retorno, fic?.transacciones]).toEqual([null, null, null, null, 0]);
  });

  it('calcula los valores promedio de compra y de venta sin las devoluciones', () => {
    const mf12 = PORTAFOLIOS_OSCAR[3];
    const { compra, venta } = promediosCompraVenta(mf12, HOY_MONITOR);
    expect(compra).toBeGreaterThan(0);
    expect(venta).toBeGreaterThan(0);
    expect(promediosCompraVenta(PORTAFOLIOS_OSCAR[0], HOY_MONITOR).venta).toBeNull();
    expect(movimientosEnRango(PORTAFOLIOS_OSCAR[6], { inicio: '2026-10-01', fin: '2026-11-12' }).length).toBe(3);
  });

  it('filtra por categoría o producto y recalcula el porcentaje sin las ocultas', () => {
    const filas = filasPortafolios(PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR, PALETA);
    expect(filtrarPorProductos(filas, []).length).toBe(7);
    expect(filtrarPorProductos(filas, ['F']).map((f) => f.id)).toEqual(['FICEFECTIVO']);
    expect(filtrarPorProductos(filas, ['MFUND']).length).toBe(6);
    const visibles = filasVisibles(filtrarPorProductos(filas, ['F']), []);
    expect(visibles[0].porcentaje).toBe(100);
    expect(filasVisibles(filas, ['FICEFECTIVO 847']).length).toBe(6);
    expect(tortaPortafolios(visibles)).toEqual([
      { nombre: 'FIC Skandia Efectivo', valor: 100, color: visibles[0].color, saldo: 8_415_300 },
    ]);
  });

  it('ofrece las categorías y los productos que tiene el cliente', () => {
    const grupos = gruposFiltro(filasPortafolios(PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR, PALETA));
    expect(grupos.map((g) => g.titulo)).toEqual(['Categorias', 'Productos']);
    expect(grupos[0].opciones.map((o) => o.nombre)).toEqual(['Ahorro e inversión', 'Ahorro e inversión (FICS)']);
    expect(grupos[1].opciones.map((o) => o.valor)).toEqual(['MFUND', 'FCO']);
    expect(gruposFiltro([])).toEqual([]);
  });

  it('arma las series (en tasa con un CDT) y repinta todo al agregar activos', () => {
    const filas = filasPortafolios(PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR, PALETA);
    const series = contratosPortafolios(filas, PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR);
    expect(series[0].nombreVisible).toBe('FVP Especial CAT 12 meses - D');
    expect(series[0].puntos[0].fechaIso).toBe('2026-01-01');
    const tasa = contratosPortafolios(filas, PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR, PLAZOS_CDT[0]);
    expect(tasa[0].nombreVisible).toBe('FVP Especial CAT 12 meses - D · CDT A 30 días');

    const agregado: ContratoGrafica = { ...series[0], clave: 'X', removible: true };
    expect(recolorearComparacion(series, [], PALETA)).toEqual(series);
    const repintadas = recolorearComparacion(series.slice(0, 2), [agregado], PALETA);
    expect(repintadas.map((c) => c.color)).toEqual([PALETA[15], PALETA[16], PALETA[17]]);
    expect(coloresSeries(repintadas).get('X')).toBe(PALETA[17]);
  });
});
