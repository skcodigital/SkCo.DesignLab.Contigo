import { CONFIG_RUTA_CON_PAC, CONFIG_RUTA_SIN_PAC, METAS } from '@features/radiografia/data/ruta-accion.mock';
import { fmtNum } from '@features/radiografia/utils/formato';
import {
  cumplimientoMeta,
  destinatarioConfirmacion,
  destinatarioModal,
  diasPlazo,
  fmtSeguimiento,
  metasIniciales,
  partesMetaCajita,
  penetracion,
  textoAvanceMeta,
  textoCalcMeta,
  textoModificacion,
  textoPlazo,
  textoResumenMeta,
} from '@features/radiografia/utils/ruta-accion';

const CON = CONFIG_RUTA_CON_PAC;
const SIN = CONFIG_RUTA_SIN_PAC;

describe('ruta-accion utils', () => {
  it('calcula la penetración resultante con los clientes nuevos', () => {
    expect(penetracion(150, CON)).toBeCloseTo(((412 + 150) / 1250) * 100);
    expect(textoCalcMeta('activar', 150, CON)).toBe(`Penetración resultante: ${fmtNum(44.96, 1)}% (hoy 33,0%)`);
    expect(textoCalcMeta('activar', 7, SIN)).toContain('(hoy 9,2%)');
  });

  it('dice cuántos faltan para profundizar y consolidar, o que ya se cumple', () => {
    // ceil(412 * 50 / 100) - 173 = 206 - 173 = 33
    expect(textoCalcMeta('profundizar', 50, CON)).toBe('+33 clientes con 2 o más productos');
    expect(textoCalcMeta('profundizar', 40, CON)).toBe('Ya se cumple hoy');
    // ceil(125 * 40 / 100) - 38 = 50 - 38 = 12
    expect(textoCalcMeta('consolidar', 40, CON)).toBe('+12 afiliados a FPOB con Agencia Norte');
    expect(textoCalcMeta('consolidar', 30, CON)).toBe('Ya se cumple hoy');
    expect(textoCalcMeta('retener', 10, CON)).toBe('Clientes nuevos menos perdidos en el año');
  });

  it('arma el resumen enviado con la base de cada empresa', () => {
    expect(textoResumenMeta('activar', 150, CON)).toBe('Activar: +150 clientes nuevos');
    expect(textoResumenMeta('profundizar', 50, CON)).toBe('Profundizar: cross-sell 2P+ de 42% a 50%');
    expect(textoResumenMeta('profundizar', 50, SIN)).toBe('Profundizar: cross-sell 2P+ de 36% a 50%');
    expect(textoResumenMeta('consolidar', 73, SIN)).toBe('Consolidar: share de FPOB de 64% a 73%');
    expect(textoResumenMeta('retener', 10, CON)).toBe('Retener: neto anual ≥ +10');
  });

  it('calcula el cumplimiento entre el dato inicial y la meta, acotado a 0–100', () => {
    // retener: (4 - 1) / (10 - 1) = 33%
    expect(cumplimientoMeta('retener', 10, CON)).toBe(33);
    // retener con meta 3: (4 - 1) / (3 - 1) > 100% → 100
    expect(cumplimientoMeta('retener', 3, CON)).toBe(100);
    // profundizar: (44,5 - 42) / (50 - 42) = 31%
    expect(cumplimientoMeta('profundizar', 50, CON)).toBe(31);
    // meta por debajo del dato inicial → 0
    expect(cumplimientoMeta('consolidar', 20, CON)).toBe(0);
  });

  it('formatea el seguimiento en % o con signo', () => {
    expect(fmtSeguimiento('retener', 4)).toBe('+4');
    expect(fmtSeguimiento('retener', 0)).toBe('0');
    expect(fmtSeguimiento('profundizar', 44.5)).toBe(fmtNum(44.5, 1) + '%');
    expect(textoAvanceMeta('retener', 10, CON)).toBe('Hoy +4 · meta +10');
  });

  it('parte el texto de la cajita con las cifras en negrita', () => {
    const partes = partesMetaCajita('profundizar', 50, CON);
    expect(partes.map((p) => p.t).join('')).toBe('Meta: 2P+ de 42% a 50% (+33 clientes)');
    expect(partes.filter((p) => p.b).map((p) => p.t)).toEqual(['50%']);
    expect(partesMetaCajita('retener', 10, CON).map((p) => p.t).join('')).toBe('Meta: neto anual ≥ +10');
  });

  it('resuelve el plazo elegido', () => {
    expect(diasPlazo('', 45)).toBe(0);
    expect(diasPlazo('15', 45)).toBe(15);
    expect(diasPlazo('otro', 45)).toBe(45);
    expect(textoPlazo(1)).toBe('1 día');
    expect(textoPlazo(30)).toBe('30 días');
  });

  it('arranca con todas las metas incluidas y su valor sugerido', () => {
    const metas = metasIniciales(SIN, METAS);
    expect(metas.map((m) => m.valor)).toEqual([7, 50, 73, 2]);
    expect(metas.every((m) => m.incluida && m.valor === m.sugerida)).toBe(true);
  });

  it('lee la última modificación desde cada vista', () => {
    const mod = { quien: 'director' as const, fecha: new Date(2026, 10, 20, 15, 5) };
    expect(textoModificacion(null, false)).toBe('');
    expect(textoModificacion(mod, false)).toMatch(/^Última modificación: .* · por ti$/);
    expect(textoModificacion(mod, true)).toMatch(/· por tu director comercial$/);
    expect(textoModificacion({ ...mod, quien: 'dueno' }, false)).toMatch(/· por Juan Alberto Rodríguez González \(FP Asignado\)$/);
  });

  it('nombra al destinatario sin PAC', () => {
    expect(destinatarioModal(null)).toBe('el FP Asignado');
    expect(destinatarioModal('Tú (director comercial)')).toBe('ti');
    expect(destinatarioModal('Felipe Arango Mejía')).toBe('Felipe Arango Mejía');
    expect(destinatarioConfirmacion(null).quien).toBe('El FP Asignado');
    expect(destinatarioConfirmacion('Tú (director comercial)')).toEqual({
      quien: 'La',
      resto: ' recibiste a tu correo y como notificación en Contigo. ',
    });
  });
});
