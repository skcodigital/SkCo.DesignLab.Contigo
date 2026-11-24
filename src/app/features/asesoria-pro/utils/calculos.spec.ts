import { contratoPorId, TOPE_CREDITO } from '../data/contratos.mock';
import { nuevaConversacion } from '../data/conversaciones.mock';
import { EstadoConversacion } from '../interfaces/conversacion';
import {
  aniosTxt,
  cajas,
  calc,
  combo,
  cred,
  creditoPanel,
  ctId,
  esp,
  impuesto,
  ordenFichas,
  retiro,
  simCredito,
  tarifaOk,
} from './calculos';
import { deIso, fNumerica, iso, masDias, miles, pct, pesos, soloDigitos } from './formato';

const st = (cambios: Partial<EstadoConversacion> = {}): EstadoConversacion => ({ ...nuevaConversacion(), ...cambios });
const ahorro = contratoPorId('ahorro');

describe('formato', () => {
  it('pesos y porcentajes en es-CO', () => {
    expect(pesos(150000000)).toBe('$150.000.000');
    expect(pesos(-1234.6)).toBe('-$1.235');
    expect(pct(14.15, 2)).toBe('14,15 %');
  });

  it('montos con miles y solo dígitos', () => {
    expect(miles(0)).toBe('');
    expect(miles(1500000)).toBe('1.500.000');
    expect(soloDigitos('$ 1.500.000abc')).toBe(1500000);
  });

  it('fechas ISO, días y formato numérico', () => {
    expect(iso(masDias(7))).toBe('2026-11-23');
    expect(iso(deIso('2026-02-28'))).toBe('2026-02-28');
    expect(fNumerica(new Date(2026, 9, 28))).toBe('28/10/2026');
  });
});

describe('calculos', () => {
  it('usa las cifras exactas del prototipo WPP para Mi ahorro con $150.000.000', () => {
    const k = calc(ahorro, 150000000, false);
    expect(k).toMatchObject({ R: 150000000, D: 157195585, rcA: 3243295, rrA: 3352290, g: 600000, cubre: true });
    expect(k.ex + k.sr + k.cc).toBeCloseTo(k.D, 0);
  });

  it('con condición especial no hay retenciones y lo certificado cuenta como exento', () => {
    const k = calc(ahorro, 10000000, true);
    expect(k).toMatchObject({ R: 10000000, D: 10040000, rcA: 0, rrA: 0, cubre: true, ex: 10040000 });
  });

  it('si no alcanza, descuenta todo lo disponible y recibe el máximo', () => {
    const k = calc(contratoPorId('finca'), 50000000, false);
    expect(k.cubre).toBe(false);
    expect(k.D).toBeLessThanOrEqual(contratoPorId('finca').disp + 1);
    expect(k.R).toBeLessThan(50000000);
  });

  it('posible impuesto: hasta el tope sin respuesta y según la respuesta de renta exenta', () => {
    const base = st({ monto: 150000000, motivo: 'liquidez', ctConf: 'ahorro' });
    const k = retiro(base, ahorro);
    expect(impuesto(base, k).txt).toBe('hasta $30.791.218');
    expect(impuesto({ ...base, rx: 'si' }, k).txt).toBe('$17.382.058');
    expect(impuesto({ ...base, rx: 'no' }, k).txt).toBe('$7.878.038');
    expect(impuesto({ ...base, rx: 'nosabe' }, k).txt).toBe('$7.878.038 a $17.382.058');
  });

  it('vivienda o pensión anulan el impuesto', () => {
    const s = st({ monto: 150000000, motivo: 'vivienda' });
    expect(esp(s)).toBe(true);
    expect(impuesto(s, retiro(s, ahorro)).txt).toBe('$0');
  });

  it('valida la tarifa entre 0 % y 39 %', () => {
    expect(tarifaOk(st({ imp: { ...nuevaConversacion().imp, tarifa: '19,5' } }))).toBe(true);
    expect(tarifaOk(st({ imp: { ...nuevaConversacion().imp, tarifa: '40' } }))).toBe(false);
    expect(tarifaOk(st())).toBe(false);
  });

  it('ordena las fichas: primero las que cubren, con el menor descuento', () => {
    const orden = ordenFichas(st({ monto: 150000000 }));
    expect(orden.filter((f) => f.k.cubre).map((f) => f.c.id)).toEqual(['ahorro', 'pension']);
    // Las que no alcanzan van después, de mayor a menor disponible
    expect(orden.slice(2).map((f) => f.c.id)).toEqual(['cuarto', 'finca']);
    expect(ctId(st({ monto: 150000000 }))).toBe('ahorro');
  });

  it('Crédito Impulso: tope preaprobado, 12 meses por defecto y respaldo del 130 %', () => {
    const c = cred(st({ monto: 200000000 }));
    expect(c.M).toBe(TOPE_CREDITO);
    expect(c.tope).toBe(true);
    expect(c.dias).toBe(360);
    expect(c.resp).toBe(Math.floor(c.cap * 1.3));
    expect(cred(st({ monto: 10000000, plazo: 3 })).dias).toBe(90);
  });

  it('combo: solo si el retiro total no alcanza', () => {
    expect(combo(st({ monto: 10000000 }), ahorro)).toBeNull();
    const cb = combo(st({ monto: 200000000 }), ahorro);
    expect(cb?.recibe).toBe((cb?.kt.R ?? 0) + (cb?.M ?? 0));
  });

  it('cajas de Opciones según el contrato y el motivo', () => {
    expect(cajas(st({ monto: 150000000, ctConf: 'ahorro' })).list).toEqual(['retiro', 'credito', 'total']);
    expect(cajas(st({ monto: 50000000, ctConf: 'ahorro' })).list).toEqual(['retiro', 'credito']);
    expect(cajas(st({ monto: 150000000, ctConf: 'ahorro', motivo: 'vivienda' })).list).toEqual(['retiro']);
    expect(cajas(st({ monto: 200000000, ctConf: 'ahorro' })).list[0]).toBe('credito');
  });

  it('años de los aportes que salen', () => {
    expect(aniosTxt(ahorro, calc(ahorro, 150000000, false))).toMatch(/^Los \$157\.195\.585 salen de aportes de 2016 .* y 2024 /);
  });

  it('simulador del crédito: parte de la caja y calcula intereses con abono', () => {
    const s = simCredito(st({ monto: 10000000 }));
    expect(s.monto).toBe(10000000);
    const sinAbono = creditoPanel(s);
    const conAbono = creditoPanel({ ...s, abono: true, fAbono: iso(masDias(30)), vAbono: 5000000 });
    expect(conAbono.total).toBeLessThan(sinAbono.total);
    expect(conAbono.bajo).toBeGreaterThan(0);
  });
});
