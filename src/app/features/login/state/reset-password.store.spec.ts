import { TEXTOS_LOGIN } from '../constants/textos';
import { ResetPasswordStore } from './reset-password.store';

describe('ResetPasswordStore', () => {
  let store: ResetPasswordStore;

  beforeEach(() => {
    store = new ResetPasswordStore();
  });

  it('arranca en el paso 1 de 3', () => {
    expect(store.paso()).toBe(1);
    expect(store.textoPaso()).toBe('1 de 3');
    store.irA(3);
    expect(store.textoPaso()).toBe('3 de 3');
  });

  it('paso 1: marca el error y lo limpia al escribir', () => {
    expect(store.confirmarCorreo()).toBe(false);
    expect(store.errorCorreo()).toBe(TEXTOS_LOGIN.obligatorio);
    store.escribirCorreo('ana');
    expect(store.errorCorreo()).toBeNull();
    expect(store.confirmarCorreo()).toBe(false);
    expect(store.errorCorreo()).toBe(TEXTOS_LOGIN.correoInvalido);
    store.escribirCorreo('ana@x.co');
    expect(store.confirmarCorreo()).toBe(true);
  });

  it('paso 2: limpia el código y exige 6 dígitos', () => {
    expect(store.escribirCodigo('12ab34')).toBe('1234');
    expect(store.confirmarCodigo()).toBe(false);
    expect(store.errorCodigo()).toBe(TEXTOS_LOGIN.codigoInvalido);
    store.escribirCodigo('123456');
    expect(store.confirmarCodigo()).toBe(true);
  });

  it('reloj: 5:00 y expira a los 300 tics', () => {
    store.iniciarReloj();
    expect(store.textoReloj()).toBe('5:00 minutos.');
    expect(store.prefijoReloj()).toBe(TEXTOS_LOGIN.expiraEn);
    store.tic();
    expect(store.textoReloj()).toBe('4:59 minutos.');
    let expiro = false;
    for (let i = 0; i < 299; i++) expiro = store.tic();
    expect(expiro).toBe(true);
    expect(store.prefijoReloj()).toBe(TEXTOS_LOGIN.expiro);
    expect(store.textoReloj()).toBe('');
  });

  it('reenviar borra el código y quita el vencimiento', () => {
    store.escribirCodigo('123');
    for (let i = 0; i < 300; i++) store.tic();
    store.reenviar();
    expect(store.codigo()).toBe('');
    expect(store.expirado()).toBe(false);
  });

  it('paso 3: error de caracteres no permitidos en vivo', () => {
    store.escribirClave('Ábc');
    expect(store.errorClave()).toBe(TEXTOS_LOGIN.caracterNoPermitido);
    store.escribirClave('Abcdef1@');
    store.escribirClaveRepetida('Abcdef1@');
    expect(store.errorClave()).toBeNull();
    expect(store.evaluacion().valida).toBe(true);
  });

  it('pantalla de carga', () => {
    store.mostrarCarga(TEXTOS_LOGIN.cargaEnviando);
    expect(store.cargando()).toBe(TEXTOS_LOGIN.cargaEnviando);
    store.ocultarCarga();
    expect(store.cargando()).toBeNull();
  });
});
