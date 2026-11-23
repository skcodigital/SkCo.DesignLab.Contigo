import { IndicadorMercado } from '../interfaces/mercado';

/** Indicadores de mercado del banner del dashboard (datos de ejemplo del prototipo). */
export const INDICADORES_MERCADO: readonly IndicadorMercado[] = [
  { nombre: 'USD/COP: $1.000', variacion: '1.1%', sube: true },
  { nombre: 'COLCAP: $1.200', variacion: '-0.2%', sube: false },
  { nombre: 'Tasa de intervención BanRep: $1.200', variacion: '2.1%', sube: true },
  { nombre: 'TES 10 años (Colombia): $400', variacion: '-2.1%', sube: false },
  { nombre: 'TXY: $10', variacion: '-0.1', sube: false },
  { nombre: 'S&P 500 (EE. UU.): $1.100', variacion: '0.1', sube: true },
  { nombre: 'NASDAQ (EEUU): $400', variacion: '-0.6%', sube: false },
  { nombre: 'Euro Stoxx 50 (Europa): $300', variacion: '11%', sube: true },
  { nombre: 'Petróleo Brent: $600', variacion: '11%', sube: false },
  { nombre: 'Oro: $900', variacion: '11%', sube: true },
];
