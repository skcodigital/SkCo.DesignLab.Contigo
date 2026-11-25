import { fLarga } from './formato';
import { CONVERSACION_ANTERIOR, nuevaConversacion } from '../data/conversaciones.mock';
import { EstadoConversacion } from '../interfaces/conversacion';
import { listaDecisiones, validarCierre } from './acuerdo';
import { cajas, cred } from './calculos';
import { cuandoTxt, etiquetaCuando, textoCliente } from './texto-cliente';
import { completa, etapasCompletas, habilitada } from './validaciones';

const st = (cambios: Partial<EstadoConversacion> = {}): EstadoConversacion => ({ ...nuevaConversacion(), ...cambios });

describe('validaciones por etapa', () => {
  it('Entender pide motivo en alcance, monto y para cuándo', () => {
    expect(completa(st({ monto: 1, motivo: 'liquidez', cuando: 'este-mes' }), 1)).toBe(true);
    expect(completa(st({ monto: 1, motivo: 'rendimientos', cuando: 'este-mes' }), 1)).toBe(false);
    expect(completa(st({ motivo: 'liquidez', cuando: 'este-mes' }), 1)).toBe(false);
  });

  it('Opciones exige la respuesta de renta exenta si el retiro toca aportes no exentos', () => {
    const base = st({ monto: 150000000, motivo: 'liquidez', cuando: 'este-mes', ctConf: 'ahorro', pref: 'retiro' });
    expect(completa(base, 3)).toBe(false);
    expect(completa({ ...base, rx: 'no' }, 3)).toBe(true);
    expect(completa({ ...base, pref: 'credito' }, 3)).toBe(true);
  });

  it('una etapa se habilita con las anteriores completas; en solo lectura todas', () => {
    const s = st({ monto: 1000000, motivo: 'liquidez', cuando: 'este-mes' });
    expect(habilitada(s, 2)).toBe(true);
    expect(habilitada(s, 3)).toBe(false);
    expect(habilitada(CONVERSACION_ANTERIOR.st, 4)).toBe(true);
    expect(etapasCompletas(CONVERSACION_ANTERIOR.st)).toBe(4);
  });
});

describe('acuerdo y texto para el cliente', () => {
  const base = st({ monto: 150000000, motivo: 'liquidez', cuando: 'este-mes', ctConf: 'ahorro', pref: 'retiro', rx: 'no', dec: 'retiro', visitadas: [1, 2, 3, 4] });

  it('ofrece las decisiones en el orden del prototipo', () => {
    expect(listaDecisiones(base, cajas(base), cred(base))).toEqual(['retiro', 'total', 'credito', 'noretira', 'pensara']);
  });

  it('el cierre de un retiro pide el trámite y arma los pendientes', () => {
    expect(validarCierre(base)).toEqual({ error: 'Elige cómo se tramita el retiro antes de registrar el cierre.' });
    expect(validarCierre({ ...base, tram: 'portal', np: { resumen: true } })).toEqual({
      ok: 'Cierre registrado: Retiro. Quedan pendientes: Tramitar por el portal · Enviar resumen de la conversación al cliente.',
    });
    expect(validarCierre({ ...base, dec: 'pensara', np: { resumen: false } })).toEqual({ ok: 'Cierre registrado: Lo va a pensar.' });
    expect(validarCierre({ ...base, dec: 'pensara', np: { resumen: false }, agenda: { via: 'teams', estado: 'si', fecha: '2026-11-28', hora: '10:00' } })).toEqual({
      ok: 'Cierre registrado: Lo va a pensar. Llamada de seguimiento agendada en Microsoft Teams para el ' + fLarga(new Date(2026, 10, 28)) + ', 10:00 a. m.',
    });
  });

  it('etiquetas de para cuándo', () => {
    expect(etiquetaCuando(st({ cuando: 'este-mes' }))).toBe('Este mes');
    expect(cuandoTxt(st({ cuando: 'esta-semana' }))).toBe('esta semana');
  });

  it('resumen para el cliente con motivo, contrato, preferencia y etapas', () => {
    const txt = textoCliente(base);
    expect(txt.split('\n')[0]).toBe('Acompañamiento al retirar · Óscar Camilo Hernández Ramírez');
    expect(txt).toContain('Motivo: Necesidad de liquidez');
    expect(txt).toContain('Contrato elegido: Mi ahorro · 100007012618 ($211.306.589)');
    expect(txt).toContain('Opción que prefiere: Retiro por $150.000.000: se descuentan $157.195.585 del contrato');
    expect(txt).toContain('Etapas conversadas: Necesidad → Lo que tiene y desde dónde → Comparador → Decisión y cierre');
    expect(txt).toContain('Decisión del cliente: Retiro parcial');
  });
});
