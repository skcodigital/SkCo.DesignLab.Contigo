import { TEXTOS_FICHA } from '../constants/textos';

/** Montos en pesos dentro de un texto: "$53.156.957", "$ 2.000.000"… */
const RX_MONTO = /\$\s?[\d.,]+/g;

/** Reemplaza cada monto del texto por la máscara del ojo ("$ ••••••"); el resto del texto queda igual. */
export function enmascararMontos(texto: string): string {
  return texto.replace(RX_MONTO, TEXTOS_FICHA.mascaraMonto);
}

/** "$ 34.275.924": pesos sin decimales con separador de miles colombiano. */
export function formatoPesos(valor: number): string {
  return '$ ' + Math.round(valor).toLocaleString('es-CO');
}

/** Número con `decimales` fijos en formato colombiano ("1.222,77"). */
export function formatoDecimal(valor: number, decimales: number): string {
  return valor.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}
