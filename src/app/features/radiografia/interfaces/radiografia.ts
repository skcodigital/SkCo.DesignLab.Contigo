/** Quién ve la radiografía: director comercial, FP Asignado (dueño del plan) u otro asesor. */
export type Vista = 'director' | 'dueno' | 'fp';

/** Empresa con Plan de Ahorro Corporativo (PAC) o sin él. */
export type PlanEmpresa = 'con' | 'sin';

/** Pestañas de la radiografía (el id coincide con el query param `tab`). */
export type TabId = 'resumen' | 'dueno' | 'clientes' | 'relacion' | 'plan' | 'ruta';

/** Listados que se abren desde una cifra ("de la cifra al listado de clientes"). */
export type ClaveLista = 'clientes' | 'monoproducto' | 'perdidos';

/** Quién gestiona a un cliente: el FP Asignado, otro asesor de la agencia u otras agencias. */
export type Gestion = 'dueno' | 'agencia' | 'otras';

/** Dirección de una variación frente al año anterior (semáforo de Logros). */
export type Direccion = 'up' | 'down' | 'flat';

/** Ámbito de los recuadros de Clientes: toda la empresa (Skandia) o solo Agencia Norte. */
export type Ambito = 'skandia' | 'agencia';

/** Trozo de texto que puede ir en negrita (reemplaza los innerHTML con <b> del prototipo). */
export interface ParteTexto {
  readonly t: string;
  readonly b?: boolean;
}

/** Contenido del tooltip que sigue al cursor sobre las gráficas. */
export interface DatoTip {
  readonly titulo: string;
  readonly lineas: readonly string[];
}
