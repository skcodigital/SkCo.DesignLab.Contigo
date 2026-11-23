import { ResumenSaldos } from '../interfaces/saldos';

export const SALDOS_OSCAR: ResumenSaldos = {
  total: '$358.900.109',
  tooltip:
    'Saldo total de todos los productos activos que tiene tu cliente con Skandia, incluyendo seguros. Gracias a tu gestión, lograremos cumplir sus objetivos.',
  kpis: [
    {
      icono: 'ahorro',
      etiqueta: 'Ahorro Voluntario e inversión',
      valor: '$53.156.957',
      fondoIcono: 'var(--sk-color-primary-soft)',
      tendencia: 'baja',
      subs: [
        { titulo: 'Rendimientos', valor: '$5.662.279' },
        { titulo: 'TIR', valor: '13.5%', desplegable: true },
      ],
    },
    {
      icono: 'pensiones',
      etiqueta: 'Pensiones y Cesantías',
      valor: '$293.743.152',
      fondoIcono: 'var(--sk-color-info-soft)',
      tendencia: 'sube',
      subs: [{ titulo: 'IBC', valor: '$5.662.279' }],
    },
    {
      icono: 'seguros',
      etiqueta: 'Seguros',
      valor: '$12.000.000',
      fondoIcono: '#E3FAF3',
      subs: [
        { titulo: 'Prima mes', valor: '$656.729' },
        { titulo: 'Suma asegurada', valor: '$199.054.656' },
      ],
    },
    {
      icono: 'credito',
      etiqueta: 'Crédito preaprobado',
      valor: '$160.500.000',
      fondoIcono: '#F1FAE3',
      subs: [],
      enlace: 'Conoce más',
    },
  ],
};
