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
