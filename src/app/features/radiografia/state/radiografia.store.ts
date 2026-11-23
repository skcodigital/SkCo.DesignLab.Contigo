import { computed, Injectable, signal } from '@angular/core';
import { PESTANAS } from '@features/radiografia/constants/pestanas';
import { nombrePestana } from '@features/radiografia/constants/textos';
import {
  CONFIG_RUTA_CON_PAC,
  CONFIG_RUTA_SIN_PAC,
  METAS,
} from '@features/radiografia/data/ruta-accion.mock';
import { ClaveLista, PlanEmpresa, TabId, Vista } from '@features/radiografia/interfaces/radiografia';
import {
  ConfigRuta,
  MetaForm,
  MetaId,
  MetaRuta,
  ModificacionRuta,
  Plazo,
  RutaEnviada,
} from '@features/radiografia/interfaces/ruta-accion';
import { diasPlazo, metasIniciales, textoResumenMeta } from '@features/radiografia/utils/ruta-accion';

/**
 * Estado-cliente de la radiografía de empresa: vista (rol), empresa (con/sin PAC), pestaña activa,
 * modales y ruta de acción. Cero I/O. Se provee en `RadiografiaPage`.
 */
@Injectable()
export class RadiografiaStore {
  // ── Vista, empresa y pestañas ──
  private readonly _plan = signal<PlanEmpresa>('con');
  private readonly _vista = signal<Vista>('director');
  private readonly _tabPedida = signal<TabId>('resumen');
  /** Celular: dentro del detalle de una sección (`body.m-detalle` del prototipo). */
  private readonly _mDetalle = signal(false);

  readonly plan = this._plan.asReadonly();
  readonly vista = this._vista.asReadonly();
  readonly mDetalle = this._mDetalle.asReadonly();
  readonly sinPac = computed(() => this._plan() === 'sin');

  /** Pestañas que ve la vista actual, en orden. */
  readonly tabsVisibles = computed<readonly TabId[]>(() =>
    PESTANAS[this._plan()].filter((p) => p.vistas.includes(this._vista())).map((p) => p.id),
  );
  /** Pestaña activa: la pedida si la vista la ve; si no, Resumen. */
  readonly tab = computed<TabId>(() =>
    this.tabsVisibles().includes(this._tabPedida()) ? this._tabPedida() : 'resumen',
  );
  readonly nombreTab = computed(() => nombrePestana(this.tab(), this._vista(), this._plan()));
  private readonly _productosPedidos = signal(false);
  /** Pendiente: el Resumen debe desplazarse a "Productos de la empresa" y enfocarlo. */
  readonly productosPedidos = this._productosPedidos.asReadonly();

  // ── Modales y panel lateral ──
  private readonly _infoAbierta = signal(false);
  private readonly _lista = signal<ClaveLista | null>(null);
  readonly infoAbierta = this._infoAbierta.asReadonly();
  readonly lista = this._lista.asReadonly();

  // ── Ruta de acción ──
  readonly configRuta = computed<ConfigRuta>(() => (this.sinPac() ? CONFIG_RUTA_SIN_PAC : CONFIG_RUTA_CON_PAC));
  private readonly _metasForm = signal<readonly MetaForm[]>(metasIniciales(CONFIG_RUTA_CON_PAC, METAS));
  private readonly _plazo = signal<Plazo>('');
  private readonly _plazoDias = signal(45);
  private readonly _mensaje = signal('');
  private readonly _planModalAbierta = signal(false);
  private readonly _editandoRuta = signal(false);
  private readonly _enviada = signal<RutaEnviada | null>(null);
  private readonly _ruta = signal<readonly MetaRuta[]>([]);
  private readonly _rutaCreada = signal(false);
  private readonly _rutaMod = signal<ModificacionRuta | null>(null);
  private readonly _metaEditando = signal<MetaId | null>(null);
  private readonly _metaDescartando = signal<MetaId | null>(null);

  readonly metasForm = this._metasForm.asReadonly();
  readonly plazo = this._plazo.asReadonly();
  readonly plazoDias = this._plazoDias.asReadonly();
  readonly mensaje = this._mensaje.asReadonly();
  readonly planModalAbierta = this._planModalAbierta.asReadonly();
  /** La modal abre en modo "Editar ruta" (título y botón distintos). */
  readonly editandoRuta = this._editandoRuta.asReadonly();
  /** Confirmación visible en la modal (reemplaza el formulario). */
  readonly enviada = this._enviada.asReadonly();
  /** Ya se envió una ruta (los botones pasan a "Ver ruta de acción enviada"). */
  readonly rutaEnviada = computed(() => this._rutaCreada() || this._enviada() !== null);
  /** Metas de la ruta en seguimiento (solo con PAC). */
  readonly ruta = this._ruta.asReadonly();
  readonly rutaCreada = this._rutaCreada.asReadonly();
  readonly rutaMod = this._rutaMod.asReadonly();
  readonly metaEditando = computed(() => this._ruta().find((m) => m.id === this._metaEditando()) ?? null);
  readonly metaDescartando = computed(() => this._ruta().find((m) => m.id === this._metaDescartando()) ?? null);
  readonly metasIncluidas = computed(() => this._metasForm().filter((m) => m.incluida));

  // ── Sin PAC: FP Asignado ──
  private readonly _asignarFpAbierta = signal(false);
  private readonly _fpAsignado = signal<string | null>(null);
  readonly asignarFpAbierta = this._asignarFpAbierta.asReadonly();
  /** Nombre del asesor elegido como FP Asignado (sin PAC); `null` mientras no haya. */
  readonly fpAsignado = this._fpAsignado.asReadonly();

  /** Aplica lo que llega por la URL. `plan=sin` siempre entra como director. */
  configurar(plan: PlanEmpresa, vista: Vista, tab: TabId | null): void {
    const vistaFinal: Vista = plan === 'sin' ? 'director' : vista;
    if (plan !== this._plan()) {
      this._plan.set(plan);
      this.reiniciarRuta();
    }
    this._vista.set(vistaFinal);
    this._tabPedida.set(tab ?? 'resumen');
  }

  seleccionarTab(tab: TabId): void {
    this._tabPedida.set(tab);
  }

  /** "Ver detalles del plan": lleva a los productos de la empresa en el Resumen. */
  irAProductos(): void {
    this._tabPedida.set('resumen');
    this._productosPedidos.set(true);
  }

  /** El Resumen ya llevó la vista a sus productos. */
  productosMostrados(): void {
    this._productosPedidos.set(false);
  }

  entrarDetalle(): void {
    this._mDetalle.set(true);
  }

  volverALista(): void {
    this._mDetalle.set(false);
  }

  abrirInfo(): void {
    this._infoAbierta.set(true);
  }

  cerrarInfo(): void {
    this._infoAbierta.set(false);
  }

  abrirLista(clave: ClaveLista): void {
    this._lista.set(clave);
  }

  cerrarLista(): void {
    this._lista.set(null);
  }

  // ── Ruta de acción: modal ──
  abrirCrearRuta(): void {
    this._planModalAbierta.set(true);
  }

  /** "Editar ruta": la misma modal de crear, con las metas actuales. */
  abrirEditarRuta(): void {
    this._editandoRuta.set(true);
    this._enviada.set(null);
    this._planModalAbierta.set(true);
  }

  cerrarPlanModal(): void {
    this._planModalAbierta.set(false);
  }

  incluirMeta(id: MetaId, incluida: boolean): void {
    this.actualizarMetaForm(id, { incluida });
  }

  cambiarValorMeta(id: MetaId, valor: number): void {
    this.actualizarMetaForm(id, { valor: Number(valor) || 0 });
  }

  usarSugerida(id: MetaId): void {
    const m = this._metasForm().find((x) => x.id === id);
    if (m) this.actualizarMetaForm(id, { valor: m.sugerida });
  }

  cambiarPlazo(plazo: Plazo): void {
    this._plazo.set(plazo);
  }

  cambiarPlazoDias(dias: number): void {
    this._plazoDias.set(dias);
  }

  cambiarMensaje(texto: string): void {
    this._mensaje.set(texto);
  }

  /** Envía la ruta: la modal pasa a la confirmación y (con PAC) arranca el seguimiento. */
  enviarRuta(): void {
    const cfg = this.configRuta();
    const incluidas = this.metasIncluidas();
    const editada = this._editandoRuta();
    this._enviada.set({
      editada,
      metas: incluidas.map((m) => ({
        id: m.id,
        texto: textoResumenMeta(m.id, m.valor, cfg),
        editada: m.valor !== m.sugerida,
      })),
      plazo: diasPlazo(this._plazo(), this._plazoDias()),
    });
    if (this.sinPac()) return;
    this._editandoRuta.set(false);
    this.modificarRuta();
    const antes = new Map(this._ruta().map((m) => [m.id, m]));
    this._ruta.set(
      incluidas.map((m) => {
        const previa = editada ? antes.get(m.id) : undefined;
        return { id: m.id, valor: m.valor, estado: previa?.estado ?? 'curso', inicio: previa?.inicio ?? new Date() };
      }),
    );
    this._rutaCreada.set(true);
  }

  // ── Ruta de acción: seguimiento ──
  marcarLograda(id: MetaId): void {
    this.actualizarMetaRuta(id, { estado: 'lograda' });
    this.modificarRuta();
  }

  deshacerMeta(id: MetaId): void {
    this.actualizarMetaRuta(id, { estado: 'curso' });
    this.modificarRuta();
  }

  pedirDescarte(id: MetaId): void {
    this._metaDescartando.set(id);
  }

  cancelarDescarte(): void {
    this._metaDescartando.set(null);
  }

  /** Descartar: la meta sale de la ruta y se desmarca en la modal. */
  confirmarDescarte(): void {
    const id = this._metaDescartando();
    if (!id) return;
    this._ruta.update((r) => r.filter((m) => m.id !== id));
    this.actualizarMetaForm(id, { incluida: false });
    this._metaDescartando.set(null);
    this.modificarRuta();
  }

  abrirEditarMeta(id: MetaId): void {
    this._metaEditando.set(id);
  }

  cerrarEditarMeta(): void {
    this._metaEditando.set(null);
  }

  /** Guarda el nuevo valor de una meta: la modal de crear/editar ruta queda con el mismo valor. */
  guardarMeta(valor: number): void {
    const id = this._metaEditando();
    if (!id) return;
    const v = Number(valor) || 0;
    this.actualizarMetaRuta(id, { valor: v });
    this.actualizarMetaForm(id, { valor: v });
    this.modificarRuta();
    this._metaEditando.set(null);
  }

  // ── Sin PAC: asignar FP ──
  abrirAsignarFp(): void {
    this._asignarFpAbierta.set(true);
  }

  cerrarAsignarFp(): void {
    this._asignarFpAbierta.set(false);
  }

  asignarFp(nombre: string): void {
    this._fpAsignado.set(nombre);
  }

  private modificarRuta(): void {
    this._rutaMod.set({ quien: this._vista() === 'dueno' ? 'dueno' : 'director', fecha: new Date() });
  }

  private reiniciarRuta(): void {
    this._metasForm.set(metasIniciales(this.configRuta(), METAS));
    this._plazo.set('');
    this._plazoDias.set(45);
    this._mensaje.set('');
    this._editandoRuta.set(false);
    this._enviada.set(null);
    this._ruta.set([]);
    this._rutaCreada.set(false);
    this._rutaMod.set(null);
    this._planModalAbierta.set(false);
    this._fpAsignado.set(null);
  }

  private actualizarMetaForm(id: MetaId, cambio: Partial<MetaForm>): void {
    this._metasForm.update((ms) => ms.map((m) => (m.id === id ? { ...m, ...cambio } : m)));
  }

  private actualizarMetaRuta(id: MetaId, cambio: Partial<MetaRuta>): void {
    this._ruta.update((r) => r.map((m) => (m.id === id ? { ...m, ...cambio } : m)));
  }
}
