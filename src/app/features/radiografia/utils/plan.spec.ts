import { GESTION } from '@features/radiografia/data/clientes.mock';
import { PLANES } from '@features/radiografia/data/plan.mock';
import { graficaAum, paresDinero, textoContratos, variacionAum, vmGestion } from '@features/radiografia/utils/plan';

describe('plan', () => {
  it('paresDinero escala a los aportes máximos y arma la neta', () => {
    const [a, b] = paresDinero(PLANES.bonificaciones.anios);
    expect(b.altoAportes).toBe(170);
    expect(a.altoAportes).toBe(Math.round((3200 / 4100) * 170));
    expect(a.altoRetiros).toBe(Math.round((950 / 4100) * 170));
    expect(a.aportes).toBe('$' + (3200).toLocaleString('es-CO'));
    expect(a.neta).toBe('Neta +$' + (2250).toLocaleString('es-CO') + ' M');
  });

  it('graficaAum ubica los puntos en el SVG y cierra el área', () => {
    const g = graficaAum(PLANES.bonificaciones.aumPts);
    expect(g.grilla).toEqual(['190.0', '136.7', '83.3', '30.0']);
    expect(g.puntos[0].x).toBe('50.0');
    expect(g.puntos[4].x).toBe('510.0');
    // VMAX = 30.000: 27.400 → 190 − 0,9133 × 160
    expect(g.puntos[4].y).toBe((190 - (27400 / 30000) * 160).toFixed(1));
    expect(g.linea.startsWith('M50.0 ')).toBe(true);
    expect(g.area.endsWith('L510.0 190 L50.0 190 Z')).toBe(true);
    expect(g.yEje).toBe(212);
  });

  it('variacionAum da el semáforo y el texto', () => {
    const v = variacionAum(27400, 20900);
    expect(v.direccion).toBe('up');
    expect(v.texto).toBe('+31,1%');
    expect(v.etiqueta).toBe('Variación +31,1% frente a octubre de 2025. Semáforo verde.');
    expect(variacionAum(90, 100).direccion).toBe('down');
    expect(variacionAum(100, 100).texto).toBe('0,0%');
  });

  it('textoContratos en singular y plural', () => {
    expect(textoContratos(1)).toBe('Distribuidos en 1 Plan');
    expect(textoContratos(3)).toBe('Distribuidos en 3 Planes');
  });

  it('vmGestion: 2026 a octubre, neto negativo en alerta', () => {
    const g = vmGestion(2026, GESTION[2026], GESTION[2025]);
    expect(g.de).toBe('de 12');
    expect(g.nuevosSub).toBe('Otras agencias vincularon 10 (a octubre)');
    expect(g.participesSub).toBe('6 en 2025 (a octubre)');
    expect(g.contratosSub).toBe('3 en 2025');
    expect(g.neto).toBe('−1');
    expect(g.netoNegativo).toBe(true);
    expect(g.netoSub).toBe('2 nuevos · 3 perdidos. La empresa: +1');
  });

  it('vmGestion: el primer año no tiene comparación', () => {
    const g = vmGestion(2024, GESTION[2024], undefined);
    expect(g.participesSub).toBe('Vinculados al plan');
    expect(g.contratosSub).toBe('Clientes con 2 o más productos');
    expect(g.netoNegativo).toBe(false);
  });
});
