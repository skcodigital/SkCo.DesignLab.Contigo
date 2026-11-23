/** Textos que arma el TS del login y del restablecimiento de contraseña (idénticos al prototipo). */
export const TEXTOS_LOGIN = {
  obligatorio: 'Este campo es obligatorio. Completa para continuar.',
  correoInvalido: 'Ingresa un correo válido.',
  codigoInvalido: 'El código que ingresaste no es válido. Verifícalo e inténtalo nuevamente.',
  caracterNoPermitido:
    'Hay un carácter no permitido. Usa letras sin tilde, números y símbolos como @ # $ % & *',
  mostrarClave: 'Mostrar contraseña',
  ocultarClave: 'Ocultar contraseña',
  cargaEnviando: 'Estamos enviando tu código, esto puede tardar unos segundos...',
  cargaValidando: 'Estamos validando tu código, esto puede tardar unos segundos...',
  cargaGuardando: 'Estamos guardando tu nueva contraseña, esto puede tardar unos segundos...',
  expiraEn: 'Tu código expira en ',
  expiro: 'Tu código expiró. ',
  minutos: ' minutos.',
} as const;

/** Tiempos del prototipo (ms / s). */
export const TIEMPOS_LOGIN = {
  carga: 1800,
  relojSegundos: 300,
  tic: 1000,
  carrusel: 7000,
  saltoSami: 700,
} as const;

/** Distancia mínima (px) para que el arrastre del banner móvil cambie de novedad. */
export const UMBRAL_SWIPE = 40;
