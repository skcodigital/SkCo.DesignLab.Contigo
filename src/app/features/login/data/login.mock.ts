import { LoginSlide, NovedadMini, ReglaClaveVista } from '../interfaces/login.interfaces';

/** Carrusel del panel derecho. Con una sola diapositiva se ocultan flechas y puntos. */
export const LOGIN_SLIDES: readonly LoginSlide[] = [
  {
    eyebrow: 'Contigo para grandes propósitos',
    titulo: { antes: 'Herramientas para que llegues ', resaltado: 'más lejos', despues: '' },
    texto:
      'Tecnología, conocimiento y un equipo experto para que te enfoques en el bienestar financiero de tus clientes.',
    chips: [
      { icono: 'decisiones', texto: 'Mejores decisiones' },
      { icono: 'clientes', texto: 'Clientes más cerca' },
      { icono: 'crecimiento', texto: 'Crecimiento sostenible' },
      { icono: 'metas', texto: 'Metas más reales' },
    ],
  },
  // Slides guardados para después (PAC y Copiloto); en el prototipo están comentados:
  // {
  //   eyebrow: 'Nuevo en la ficha de cliente',
  //   titulo: { antes: 'Planes de ', resaltado: 'ahorro corporativo', despues: ' en la ficha' },
  //   texto: 'Consulta desde la ficha de la empresa sus planes, el desempeño de cada uno y el detalle de sus partícipes.',
  //   chips: [
  //     { icono: 'desempeno', texto: 'Desempeño del plan' },
  //     { icono: 'participes', texto: 'Detalle de partícipes' },
  //     { icono: 'consolidado', texto: 'Consolidado y condicionado' },
  //     { icono: 'nit', texto: 'Busca por el NIT' },
  //   ],
  // },
  // {
  //   eyebrow: 'Nuevo en Contigo',
  //   titulo: { antes: 'Sami te acompaña en cada ', resaltado: 'conversación', despues: '' },
  //   texto: 'Journeys guiados para acompañar a tus clientes en momentos clave, como cuando evalúan un retiro.',
  //   chips: [
  //     { icono: 'journeys', texto: 'Journeys guiados' },
  //     { icono: 'momentos', texto: 'Momentos clave' },
  //     { icono: 'conversaciones', texto: 'Conversaciones con contexto' },
  //     { icono: 'historial', texto: 'Historial de cada cliente' },
  //   ],
  // },
];

/** Banner móvil (≤900px). */
export const NOVEDADES_MINI: readonly NovedadMini[] = [
  {
    eyebrow: 'Contigo para grandes propósitos',
    titulo: { antes: 'Herramientas para que llegues ', resaltado: 'más lejos', despues: '' },
  },
  {
    eyebrow: 'Nuevo en la ficha de cliente',
    titulo: { antes: 'Planes de ', resaltado: 'ahorro corporativo', despues: ' en la ficha' },
  },
  {
    eyebrow: 'Nuevo en Contigo',
    titulo: { antes: 'Sami te acompaña en cada ', resaltado: 'conversación', despues: '' },
  },
];

/** Reglas visibles de la nueva contraseña (paso 3). */
export const REGLAS_CLAVE: readonly ReglaClaveVista[] = [
  { id: 'len', texto: '8–16 caracteres' },
  { id: 'may', texto: 'Una mayúscula' },
  { id: 'min', texto: 'Una minúscula' },
  { id: 'num', texto: 'Un número' },
  { id: 'sim', texto: 'Un símbolo' },
  { id: 'igual', texto: 'Coinciden' },
];
