import { CONTRATOS_OSCAR } from '@features/monitor/data/detalle-cliente.mock';
import { HOY_MONITOR, PLAZOS_CDT, PORTAFOLIOS_SKANDIA } from '@features/monitor/data/detalle-catalogos.mock';
import { activoComparado } from '@features/monitor/utils/detalle-activos';
import { ContratoGrafica } from '@features/monitor/interfaces/detalle';
import {
  armarGraficaContratos,
  claveContrato,
  contratoComparado,
  contratosEnRango,
  detallePuntoContratos,
  rellenarTasa,
  saldoHoy,
  saldoYRendimiento,
  valorTooltipContrato,
} from '@features/monitor/utils/detalle-contratos';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

const RANGO = { inicio: '2026-10-12', fin: '2026-11-12' };

describe('detalle-contratos', () => {
  it('arma la clave de la serie como producción', () => {
    expect(claveContrato('MULTIFUND', '100000063061')).toBe('Multifund 061');
  });

  it('cuadra con la ficha de Óscar: saldo y rendimientos de hoy', () => {
    const [mf, fic] = CONTRATOS_OSCAR;
    expect(saldoHoy(mf)).toBe(52_732_191);
    expect(saldoHoy(fic)).toBe(8_415_300);
    expect(saldoYRendimiento(mf, '2026-11-12', HOY_MONITOR)).toEqual({ saldo: 52_732_191, rendimiento: 5_248_910 });
    expect(saldoYRendimiento(fic, '2026-11-12', HOY_MONITOR)).toEqual({ saldo: 8_415_300, rendimiento: 612_480 });
    expect(saldoYRendimiento(fic, '2025-12-31', HOY_MONITOR)).toBeNull();
  });

  it('ordena los contratos por saldo y les da el color de la paleta', () => {
    const contratos = contratosEnRango([...CONTRATOS_OSCAR].reverse(), RANGO, HOY_MONITOR, COLORES_GRAFICA.cliente);
    expect(contratos.map((c) => c.clave)).toEqual(['Multifund 061', 'Efectivo 847']);
    expect(contratos.map((c) => c.color)).toEqual(['#A1DD70', '#A4D7E1']);
    expect(contratos[0].puntos.length).toBe(32);
  });

  it('normaliza a 1.000 en la primera fecha y deja el eje desde 0', () => {
    const datos = armarGraficaContratos(contratosEnRango(CONTRATOS_OSCAR, RANGO, HOY_MONITOR, COLORES_GRAFICA.cliente));
    expect(datos.etiquetas[0]).toBe('12 oct 26');
    expect(datos.etiquetas.at(-1)).toBe('12 nov 26');
    expect(datos.series[0].datos[0].value).toBe(1000);
    expect(datos.series[0].nombreVisible).toBe('Multifund 061');
    expect(datos.yMin).toBeGreaterThanOrEqual(0);
    expect(datos.yMax).toBeGreaterThan(1000);
    expect(armarGraficaContratos([])).toEqual({ etiquetas: [], series: [], yMin: 0, yMax: 0 });
  });

  it('los activos comparados muestran su producto en la leyenda y los CDT van punteados', () => {
    const cdt: ContratoGrafica = {
      clave: 'CDT-30',
      nombreProducto: 'CDT A 30 días',
      color: '#ED3833',
      removible: true,
      tipo: 'cdt',
      puntos: [{ fechaIso: '2026-11-12', etiqueta: '12 nov 26', valor: 9.2, valorNormalizado: 9.2 }],
    };
    const [serie] = armarGraficaContratos([cdt], true).series;
    expect(serie.nombreVisible).toBe('CDT A 30 días');
    expect(serie.punteada).toBe(true);
    expect(serie.grosor).toBe(1.5);
    expect(serie.suave).toBe(false);
  });

  it('formatea el valor del tooltip', () => {
    expect(valorTooltipContrato('-9.456', true, false)).toBe(-9.46);
    expect(valorTooltipContrato('-4012.358', false, true)).toBe(4012.35);
    expect(valorTooltipContrato(null, false, false)).toBeNull();
  });

  it('en tasa repite el último cierre hasta el último dato real', () => {
    const p = (value: number | null, valorTooltip: number | null, fecha: string) => ({ value, valorTooltip, fecha, nombre: 'x' });
    const datos = rellenarTasa([p(1, 1, 'a'), p(null, null, 'b'), p(2, 2, 'c'), p(null, null, 'd')]);
    expect(datos[1]).toEqual({ ...p(1, 1, 'a'), fecha: 'b' });
    expect(datos[3].value).toBeNull();
  });

  it('el detalle del punto trae saldo y rendimiento solo de los contratos propios', () => {
    const detalle = detallePuntoContratos(CONTRATOS_OSCAR, HOY_MONITOR);
    const registros = detalle(0, [
      { value: 1, nombre: 'Multifund 061', fechaIso: '2026-11-12' },
      { value: 1, nombre: 'Paciente', fechaIso: '2026-11-12', removible: true },
    ]);
    expect(registros[0]).toEqual({ rendimiento: 5_248_910, saldo: 52_732_191, fechaExtracto: '2026-11-12' });
    expect(registros[1]).toEqual({ rendimiento: null, saldo: null, fechaExtracto: '2026-11-12' });
  });

  it('con un CDT los contratos pasan a tasa y la leyenda lleva el plazo', () => {
    const [mf] = contratosEnRango(CONTRATOS_OSCAR, RANGO, HOY_MONITOR, COLORES_GRAFICA.cliente, PLAZOS_CDT[0]);
    expect(mf.nombreVisible).toBe('Multifund 061 · CDT A 30 días');
    const tasa = Number(mf.puntos.at(-1)?.valor);
    expect(tasa).toBeGreaterThan(0);
    expect(tasa).toBeLessThan(40);
    const registros = detallePuntoContratos(CONTRATOS_OSCAR, HOY_MONITOR)(0, [
      { value: 1, nombre: 'Multifund 061 · CDT A 30 días', fechaIso: '2026-11-12' },
    ]);
    expect(registros[0].saldo).toBe(52_732_191);
    const comparado = contratoComparado(activoComparado(PORTAFOLIOS_SKANDIA[0], RANGO, HOY_MONITOR, '#000', PLAZOS_CDT[0]));
    expect(comparado.nombreVisible).toBe('FPV Strategist Conservador · CDT A 30 días');
    expect(comparado.removible).toBe(true);
  });
});
