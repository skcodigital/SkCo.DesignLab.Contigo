// Arma lo que muestra el panel lateral "de la cifra al listado" según la lista, la vista y la empresa.
import { LISTAS_CON_PAC, LISTAS_CON_PAC_FP, LISTAS_SIN_PAC } from '@features/radiografia/data/listas.mock';
import { FiltroLista, FilaLista, ItemResumenLista, VistaLista } from '@features/radiografia/interfaces/lista';
import { ClaveLista, PlanEmpresa, Vista } from '@features/radiografia/interfaces/radiografia';

const CANDADO_DUENO =
  ' los atienden otros asesores. Ves el total para dimensionar la oportunidad, pero no su detalle; la coordinación pasa por tu director.';
const CANDADO_DIRECTOR =
  ' los atienden asesores de otras agencias. Ves el total para dimensionar la oportunidad, pero no su detalle; la coordinación pasa por la dirección de cada agencia.';

const minusculaInicial = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

export function armarLista(clave: ClaveLista, vista: Vista, plan: PlanEmpresa): VistaLista | null {
  return plan === 'sin' ? armarSinPac(clave) : armarConPac(clave, vista);
}

function armarConPac(clave: ClaveLista, vista: Vista): VistaLista | null {
  const def = (vista === 'fp' ? LISTAS_CON_PAC_FP : LISTAS_CON_PAC)[clave];
  if (!def) return null;
  const esDueno = vista === 'dueno' || vista === 'fp';
  const esFp = vista === 'fp';
  const verTodo = !!def.todosDirector && vista === 'director';
  let cols = def.cols;
  let filas = def.filas;
  // El FP Asignado ve solo sus clientes, sin la columna "Atendido por"
  if (def.todosDirector && vista === 'dueno') {
    const i = cols.indexOf('Atendido por');
    cols = cols.filter((_, k) => k !== i);
    filas = filas
      .filter((fila) => fila.gestion === 'dueno')
      .map((fila) => ({ ...fila, celdas: fila.celdas.filter((_, k) => k !== i) }));
  }
  const otros = def.total - def.dueno;
  const titulo =
    def.todosDirector && esDueno
      ? `Tus clientes en esta empresa (${def.dueno})`
      : esDueno
        ? `Tus ${minusculaInicial(def.titulo)} (${def.dueno})`
        : `${def.titulo} (${def.total})`;

  let resumen: ItemResumenLista[];
  if (esFp) resumen = [{ gestion: 'dueno', etiqueta: 'Tuyos: ', valor: def.dueno }];
  else if (esDueno)
    resumen = [
      { gestion: 'dueno', etiqueta: 'Tuyos: ', valor: def.dueno },
      { gestion: 'otras', etiqueta: 'Otros asesores: ', valor: otros, sufijo: ' (agregado)', apagado: true },
    ];
  else
    resumen = [
      { gestion: 'dueno', etiqueta: 'FP Asignado: ', valor: def.dueno },
      { gestion: 'agencia', etiqueta: 'Agencia Norte: ', valor: def.agencia },
      // El director que ve todos los clientes no ve las otras agencias como agregado
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: def.otras, apagado: !verTodo },
    ];

  return {
    titulo,
    sub: def.sub,
    cols,
    filas,
    resumen,
    candado:
      esFp || verTodo
        ? null
        : esDueno
          ? { cifra: `${otros} clientes`, texto: CANDADO_DUENO }
          : { cifra: `${def.otras} clientes`, texto: CANDADO_DIRECTOR },
    conFiltro: !(esDueno || verTodo),
    filtroInicial: esDueno ? 'dueno' : 'todos',
    completa: true,
    totalVisible: verTodo ? def.total : null,
    dueno: def.dueno,
    agencia: def.agencia,
    otras: def.otras,
  };
}

/** Sin PAC solo entra el director: detalle de su agencia, sin filtro por dueño. */
function armarSinPac(clave: ClaveLista): VistaLista | null {
  const def = LISTAS_SIN_PAC[clave];
  if (!def) return null;
  return {
    titulo: `${def.titulo} (${def.total})`,
    sub: def.sub,
    cols: def.cols,
    filas: def.filas,
    resumen: [
      { gestion: 'agencia', etiqueta: 'Tu agencia: ', valor: def.agencia },
      { gestion: 'otras', etiqueta: 'Otras agencias: ', valor: def.otras, apagado: true },
    ],
    candado: { cifra: `${def.otras} clientes`, texto: CANDADO_DIRECTOR },
    conFiltro: false,
    filtroInicial: 'todos',
    completa: true,
    totalVisible: null,
    dueno: def.dueno,
    agencia: def.agencia,
    otras: def.otras,
  };
}

export function filtrarFilas(lista: VistaLista, filtro: FiltroLista): readonly FilaLista[] {
  return lista.filas.filter((f) => filtro === 'todos' || f.gestion === filtro);
}

/** Total del que se muestran las filas (para "Mostrando X de Y"). */
export function totalLista(lista: VistaLista, filtro: FiltroLista): number {
  if (lista.totalVisible) return lista.totalVisible;
  return filtro === 'todos' ? lista.dueno + lista.agencia : lista[filtro];
}
