import { TEXTOS_LOGIN } from '../constants/textos';
import { ReglaClave } from '../interfaces/login.interfaces';

const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Política de Contigo: 8-16 caracteres con 3 de 4 tipos (minúsculas, mayúsculas, dígitos, símbolos permitidos)
const SIMBOLO = /[@#$%^&*\-_+=\[\]{}|\\:',?\/`~"();.]/;
const PERMITIDO = /^[A-Za-z0-9@#$%^&*\-_+=\[\]{}|\\:',?\/`~"();.]*$/;

/** Prototipo: la contraseña del login es incorrecta si tiene menos de 8 caracteres. */
export const MIN_CLAVE_LOGIN = 8;
export const LARGO_CODIGO = 6;

export function esCorreoValido(correo: string): boolean {
  return CORREO.test(correo);
}

export interface ResultadoLogin {
  errorCorreo: string | null;
  errorClave: string | null;
  /** Alerta «Datos incorrectos». */
  datosIncorrectos: boolean;
}

/** Errores del login (como Portal Clientes): campo vacío, correo no válido y datos incorrectos. */
export function validarLogin(correo: string, clave: string): ResultadoLogin {
  const m = correo.trim();
  const errorCorreo = !m ? TEXTOS_LOGIN.obligatorio : esCorreoValido(m) ? null : TEXTOS_LOGIN.correoInvalido;
  const errorClave = clave ? null : TEXTOS_LOGIN.obligatorio;
  const datosIncorrectos = !errorCorreo && !errorClave && clave.length < MIN_CLAVE_LOGIN;
  return { errorCorreo, errorClave, datosIncorrectos };
}

/** Paso 1 del restablecimiento: `null` si el correo es válido. */
export function errorCorreoReset(correo: string): string | null {
  const m = correo.trim();
  if (esCorreoValido(m)) return null;
  return m ? TEXTOS_LOGIN.correoInvalido : TEXTOS_LOGIN.obligatorio;
}

/** Deja solo dígitos y máximo 6. */
export function limpiarCodigo(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, LARGO_CODIGO);
}

/** Paso 2: en el prototipo cualquier código de 6 dígitos es válido. */
export function errorCodigo(codigo: string): string | null {
  if (codigo.length === LARGO_CODIGO) return null;
  return codigo ? TEXTOS_LOGIN.codigoInvalido : TEXTOS_LOGIN.obligatorio;
}

export interface EvaluacionClave {
  reglas: Record<ReglaClave, boolean>;
  /** Al menos 3 de 4 tipos de carácter. */
  tres: boolean;
  /** Hay caracteres fuera de los permitidos. */
  noPermitidos: boolean;
  valida: boolean;
}

export function evaluarClave(clave: string, repetida: string): EvaluacionClave {
  const reglas: Record<ReglaClave, boolean> = {
    len: clave.length >= 8 && clave.length <= 16,
    min: /[a-z]/.test(clave),
    may: /[A-Z]/.test(clave),
    num: /\d/.test(clave),
    sim: SIMBOLO.test(clave),
    igual: !!clave && clave === repetida,
  };
  const tres = [reglas.min, reglas.may, reglas.num, reglas.sim].filter(Boolean).length >= 3;
  const noPermitidos = !PERMITIDO.test(clave);
  return { reglas, tres, noPermitidos, valida: reglas.len && tres && reglas.igual && !noPermitidos };
}

/** `300` → `'5:00 minutos.'` */
export function formatearReloj(segundos: number): string {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}${TEXTOS_LOGIN.minutos}`;
}
