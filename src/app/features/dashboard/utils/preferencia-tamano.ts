/** Tamaño del módulo Planeación Pro: se recuerda en este navegador (localStorage `nc-pp-tam`, como el prototipo). */
const LLAVE_TAMANO = 'nc-pp-tam';

export function leerModuloAmplio(): boolean {
  try {
    return localStorage.getItem(LLAVE_TAMANO) === 'amplio';
  } catch {
    return false;
  }
}

export function guardarModuloAmplio(amplio: boolean): void {
  try {
    localStorage.setItem(LLAVE_TAMANO, amplio ? 'amplio' : 'compacto');
  } catch {
    // Sin almacenamiento la preferencia vive solo en memoria.
  }
}
