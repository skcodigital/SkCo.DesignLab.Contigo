/** Pesos colombianos con punto de miles y sin decimales: 52732191 → «$52.732.191». */
export function formatearPesos(valor: number): string {
  return '$' + Math.round(valor).toLocaleString('es-CO').replace(/,/g, '.');
}

/** Primer nombre del cliente (como lo nombran los avisos del prototipo). */
export function primerNombre(nombre: string): string {
  return nombre.split(' ')[0] ?? '';
}

/** Nombre y primer apellido (o dos nombres) del asesor: «Juan Camilo Rodríguez» → «Juan Camilo». */
export function nombreCorto(nombre: string): string {
  return nombre.split(' ').slice(0, 2).join(' ');
}
