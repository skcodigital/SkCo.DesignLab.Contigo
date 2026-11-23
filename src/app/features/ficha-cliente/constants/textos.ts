/** Textos que arma el TS de la ficha del cliente. */
export const TEXTOS_FICHA = {
  ojo: { ocultar: 'Ocultar saldos', mostrar: 'Mostrar saldos' },
  saldos: { recoger: 'Recoger saldos', ver: 'Ver saldos' },
  ampliar: { ampliar: 'Ampliar', reducir: 'Reducir' },
  mascaraMonto: '$ ••••••',
  composicion: {
    donaPrefijo: 'Composición al ',
  },
  calendario: {
    meses: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ],
  },
  producto: {
    verFicha: (nombre: string, contrato: string) => `Ver ficha del producto ${nombre}, contrato ${contrato}`,
  },
} as const;
