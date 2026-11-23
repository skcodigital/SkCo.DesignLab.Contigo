import { Retiro } from '../interfaces/retiros';

export const RETIROS_EN_CURSO: readonly Retiro[] = [
  {
    id: 'retiro-1',
    titulo: 'Contrato #100000063061 - Código de confirmación #202611021528170P',
    cuando: 'Finalizará el jueves en la tarde',
    pasosTotales: 3,
    pasosHechos: 2,
    paso: 'Estamos procesando el retiro',
    detalle: [
      { etiqueta: 'Monto solicitado', valor: '$2.000.000' },
      { etiqueta: 'Estado', valor: 'En proceso' },
      { etiqueta: 'Destino', valor: 'Bancolombia | Cuenta de ahorros | Titular' },
      { etiqueta: 'Tipo de retiro', valor: 'Parcial' },
      { etiqueta: 'Impuestos del retiro', valor: '$0' },
      { etiqueta: 'Monto bruto del retiro', valor: '$2.000.000' },
      { etiqueta: 'Solicitado el', valor: '02/11/2026 - 3:28 p.m.' },
    ],
  },
];
