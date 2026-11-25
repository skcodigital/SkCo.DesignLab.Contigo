/** sessionStorage puede lanzar (modo privado, sitio bloqueado): estas funciones nunca rompen la vista. */
export function leerSesion(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function guardarSesion(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento la sesión vive solo en memoria.
  }
}

/** localStorage (persiste entre sesiones en este navegador); nunca rompe la vista. */
export function leerLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function guardarLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento, la intro puede volver a mostrarse en otra carga.
  }
}
