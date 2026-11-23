import { TEXTOS_LOGIN } from '../constants/textos';
import {
  errorCodigo,
  errorCorreoReset,
  esCorreoValido,
  evaluarClave,
  formatearReloj,
  limpiarCodigo,
  validarLogin,
} from './validaciones';

describe('validaciones del login', () => {
  it('valida el formato de correo del prototipo', () => {
    expect(esCorreoValido('ana@skandia.com.co')).toBe(true);
    expect(esCorreoValido('ana@skandia')).toBe(false);
    expect(esCorreoValido('ana skandia@x.co')).toBe(false);
    expect(esCorreoValido('')).toBe(false);
  });

  it('marca campos vacíos como obligatorios', () => {
    expect(validarLogin('  ', '')).toEqual({
      errorCorreo: TEXTOS_LOGIN.obligatorio,
      errorClave: TEXTOS_LOGIN.obligatorio,
      datosIncorrectos: false,
    });
  });

  it('marca el correo inválido', () => {
    expect(validarLogin('ana@', '12345678').errorCorreo).toBe(TEXTOS_LOGIN.correoInvalido);
  });

  it('contraseña de menos de 8 caracteres = datos incorrectos', () => {
    expect(validarLogin(' ana@x.co ', '1234567')).toEqual({
      errorCorreo: null,
      errorClave: null,
      datosIncorrectos: true,
    });
    expect(validarLogin('ana@x.co', '12345678').datosIncorrectos).toBe(false);
  });

  it('no muestra la alerta si hay errores de campo', () => {
    expect(validarLogin('ana', '123').datosIncorrectos).toBe(false);
  });
});

describe('validaciones del restablecimiento', () => {
  it('paso 1: obligatorio vs correo inválido', () => {
    expect(errorCorreoReset('')).toBe(TEXTOS_LOGIN.obligatorio);
    expect(errorCorreoReset('ana')).toBe(TEXTOS_LOGIN.correoInvalido);
    expect(errorCorreoReset(' ana@x.co ')).toBeNull();
  });

  it('paso 2: deja solo 6 dígitos y exige 6', () => {
    expect(limpiarCodigo('12a3-4567')).toBe('123456');
    expect(errorCodigo('')).toBe(TEXTOS_LOGIN.obligatorio);
    expect(errorCodigo('123')).toBe(TEXTOS_LOGIN.codigoInvalido);
    expect(errorCodigo('123456')).toBeNull();
  });

  it('paso 3: reglas de la contraseña', () => {
    const e = evaluarClave('Abcdef1@', 'Abcdef1@');
    expect(e.reglas).toEqual({ len: true, may: true, min: true, num: true, sim: true, igual: true });
    expect(e.valida).toBe(true);
  });

  it('paso 3: basta con 3 de 4 tipos', () => {
    expect(evaluarClave('abcdefg1@', 'abcdefg1@').valida).toBe(true);
    expect(evaluarClave('abcdefgh1', 'abcdefgh1').valida).toBe(false);
  });

  it('paso 3: largo 8–16 y coincidencia', () => {
    expect(evaluarClave('Ab1@', 'Ab1@').reglas.len).toBe(false);
    expect(evaluarClave('Abcdefgh1@abcdefg', 'Abcdefgh1@abcdefg').reglas.len).toBe(false);
    expect(evaluarClave('Abcdef1@', 'Abcdef1?').valida).toBe(false);
    expect(evaluarClave('', '').reglas.igual).toBe(false);
  });

  it('paso 3: caracteres no permitidos bloquean', () => {
    const e = evaluarClave('Ábcdef1@', 'Ábcdef1@');
    expect(e.noPermitidos).toBe(true);
    expect(e.valida).toBe(false);
    // Política del prototipo: «!» no está entre los símbolos permitidos.
    expect(evaluarClave('Abcdef1!', 'Abcdef1!').noPermitidos).toBe(true);
  });

  it('formatea el reloj', () => {
    expect(formatearReloj(300)).toBe('5:00 minutos.');
    expect(formatearReloj(65)).toBe('1:05 minutos.');
    expect(formatearReloj(0)).toBe('0:00 minutos.');
  });
});
