import { AMBITOS } from '@features/radiografia/data/clientes.mock';
import {
  ariaDona,
  ariaProductos,
  barrasEdad,
  paresEvolucion,
  pctAncho,
  pctDosOMas,
  segmentosDona,
  tramosProductos,
} from '@features/radiografia/utils/graficas-clientes';

describe('graficas-clientes', () => {
  describe('paresEvolucion', () => {
    it('escala al máximo (170 px) con alto mínimo de 8 px y arma el neto', () => {
      const [a, , c] = paresEvolucion(AMBITOS.skandia.evol);
      expect(a.altoNuevos).toBe(170);
      expect(a.altoPerdidos).toBe(Math.round((9 / 22) * 170));
      expect(a.neto).toBe('Neto +13');
      expect(a.claseNeto).toBe('');
      expect(c.aria).toBe('2026*: 12 nuevos, 11 perdidos, neto +1');
    });

    it('marca el neto negativo y en cero', () => {
      const [, , c] = paresEvolucion(AMBITOS.agencia.evol);
      expect(c.neto).toBe('Neto −1');
      expect(c.claseNeto).toBe('neto-neg');
      const [cero] = paresEvolucion([{ anio: '2026*', nuevos: 1, perdidos: 1 }]);
      expect(cero.claseNeto).toBe('neto-cero');
    });

    it('respeta el mínimo pedido (0 en la vista del asesor)', () => {
      const [p] = paresEvolucion([{ anio: '2024', nuevos: 1, perdidos: 0 }], 0);
      expect(p.altoPerdidos).toBe(0);
      expect(paresEvolucion([{ anio: '2024', nuevos: 1, perdidos: 0 }])[0].altoPerdidos).toBe(8);
    });
  });

  it('pctAncho usa coma decimal y hasta un decimal', () => {
    expect(pctAncho(13.7)).toBe('13,7%');
    expect(pctAncho(67)).toBe('67%');
  });

  describe('productos por cliente', () => {
    it('calcula porcentajes, valores visibles (≥ 10%) y el tramo claro', () => {
      const t = tramosProductos(AMBITOS.skandia.prod, 412);
      expect(t.map((x) => x.pct)).toEqual([58, 24, 12, 6]);
      expect(t.map((x) => x.conValor)).toEqual([true, true, true, false]);
      expect(t[2].claro).toBe(true);
      expect(ariaProductos(t)).toBe('1 producto 58%, 2 productos 24%, 3 productos 12%, 4 o más 6%.');
    });

    it('clientes con 2 o más productos', () => {
      expect(pctDosOMas(AMBITOS.skandia.prod, 412)).toBe('42%');
      expect(pctDosOMas(AMBITOS.agencia.prod, 201)).toBe('48,3%');
    });
  });

  describe('segmentosDona', () => {
    it('reparte la circunferencia y acumula el desplazamiento', () => {
      const s = segmentosDona(AMBITOS.skandia.seg, 412);
      expect(s[0].dash).toBe('286.10 153.72');
      expect(s[0].offset).toBe('0.00');
      expect(s[1].offset).toBe('-286.10');
      expect(s[3].tip).toBe('Wealth: 12 clientes · 3%');
    });

    it('singular para un cliente y sin % en el aria cuando es 0', () => {
      const s = segmentosDona([1, 1, 0, 0], 2);
      expect(s[0].tip).toBe('Finanzas Personales: 1 cliente · 50%');
      expect(ariaDona(s)).toBe('Clientes por segmento: Finanzas Personales 1 (50%), Privilegio 1 (50%), Elite 0, Wealth 0.');
    });
  });

  it('barrasEdad escala al máximo (180 px)', () => {
    const b = barrasEdad(AMBITOS.skandia.edad, 412);
    expect(b.map((x) => x.alto)).toEqual([71, 180, 150, 68]);
    expect(b[0].tip).toBe('62 clientes · 15%');
    expect(b[3].aria).toBe('Más de 60 años: 60 clientes');
  });
});
