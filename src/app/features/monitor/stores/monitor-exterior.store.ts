import { computed, Injectable, linkedSignal, signal } from '@angular/core';
import { HOY_MONITOR, PLAZOS_CDT } from '@features/monitor/data/detalle-catalogos.mock';
import { PERIODO_INICIAL_EXTERIOR } from '@features/monitor/data/detalle-exterior.mock';
import {
  CATALOGO_EXTERIOR,
  SELECCION_EJEMPLO,
  SELECCION_EJEMPLO_CDT,
  SELECCION_VACIA,
} from '@features/monitor/data/exterior-catalogos.mock';
import { RangoFechas } from '@features/monitor/interfaces/comunes';
import { ActivoComparado } from '@features/monitor/interfaces/detalle';
import { EstadoExterior, MensajeAsistente, SeleccionExterior } from '@features/monitor/interfaces/exterior';
import { activosComparados } from '@features/monitor/utils/detalle-activos';
import { agregarMensaje, respuestaAsistente, textoRespuesta } from '@features/monitor/utils/exterior-asistente';
import {
  aplicaAlMomento,
  definicionesSeleccion,
  haySeleccion,
  quitarActivo,
  rangoDeConsulta,
} from '@features/monitor/utils/exterior-seleccion';
import { rangoPorPeriodo } from '@features/monitor/utils/periodos';

const SIN_RANGO: RangoFechas = { inicio: '', fin: '' };

/**
 * Estado de la página del Monitor exterior (se provee en la página; cero I/O): lo elegido en «Selecciona y
 * compara» y lo que ya se graficó, el periodo, los activos de la comparación, los paneles abiertos y la
 * conversación del asistente.
 *
 * `seleccion` es lo marcado en las listas; `graficada`, lo que pinta la comparación. En escritorio son iguales;
 * en la modal de móvil algunas listas esperan a «Graficar selección» (ver `aplicaAlMomento`).
 */
@Injectable()
export class MonitorExteriorStore {
  readonly hoy = HOY_MONITOR;

  private readonly _seleccion = signal<SeleccionExterior>(SELECCION_VACIA);
  private readonly _graficada = signal<SeleccionExterior>(SELECCION_VACIA);
  private readonly _periodo = signal<number>(PERIODO_INICIAL_EXTERIOR);
  private readonly _rango = signal<RangoFechas>(SIN_RANGO);
  private readonly _conError = signal(false);
  private readonly _panelAbierto = signal(true);
  private readonly _comparadorMovil = signal(false);
  private readonly _asistenteAbierto = signal(false);
  private readonly _mensajes = signal<readonly MensajeAsistente[]>([]);
  private readonly _pendiente = signal<string | null>(null);

  readonly seleccion = this._seleccion.asReadonly();
  readonly periodo = this._periodo.asReadonly();
  readonly rango = this._rango.asReadonly();
  readonly conError = this._conError.asReadonly();
  /** «Selecciona y compara» desplegado en escritorio. */
  readonly panelAbierto = this._panelAbierto.asReadonly();
  /** Modal de pantalla completa de «Compara» en móvil. */
  readonly comparadorMovil = this._comparadorMovil.asReadonly();
  readonly asistenteAbierto = this._asistenteAbierto.asReadonly();
  readonly mensajes = this._mensajes.asReadonly();
  /** El asistente está «Escribiendo». */
  readonly escribiendo = computed(() => this._pendiente() !== null);

  readonly haySeleccion = computed(() => haySeleccion(this._seleccion()));

  /** Rango consultado: con «Personalizado» sin las dos fechas se conserva el anterior. */
  private readonly rangoConsulta = linkedSignal<{ periodo: number; rango: RangoFechas }, RangoFechas>({
    source: () => ({ periodo: this._periodo(), rango: this._rango() }),
    computation: ({ periodo, rango }, anterior) =>
      rangoDeConsulta(periodo, rango, this.hoy) ??
      anterior?.value ??
      rangoPorPeriodo(PERIODO_INICIAL_EXTERIOR, this.hoy),
  });

  /** Activos de la comparación (`nc-mon-comparacion`). */
  readonly activos = computed<ActivoComparado[]>(() =>
    activosComparados(
      definicionesSeleccion(this._graficada(), CATALOGO_EXTERIOR),
      this.rangoConsulta(),
      this.hoy,
      PLAZOS_CDT,
    ),
  );

  /** Aplica el estado de ejemplo pedido en la URL; sin estado, deja la página como arranca. */
  configurar(estado: EstadoExterior | null): void {
    this.restablecer();
    this._conError.set(estado === 'error');
    if (estado === 'ejemplo' || estado === 'ejemplo-cdt') {
      const s = estado === 'ejemplo' ? SELECCION_EJEMPLO : SELECCION_EJEMPLO_CDT;
      this._seleccion.set(s);
      this._graficada.set(s);
    }
  }

  // ───────────────────────────── Selección ─────────────────────────────

  /** Cambio en una lista de «Selecciona y compara» (desde el panel lateral o desde la modal de móvil). */
  elegir(cambio: Partial<SeleccionExterior>, enModal = false): void {
    this._seleccion.update((s) => ({ ...s, ...cambio }));
    if (aplicaAlMomento(cambio, enModal)) {
      this._graficada.update((s) => ({ ...s, ...cambio }));
    }
  }

  /** «Graficar selección» (móvil): grafica lo marcado y cierra la modal. */
  graficarSeleccion(): void {
    this._graficada.set(this._seleccion());
    this._comparadorMovil.set(false);
  }

  /** Retira un activo desde la leyenda o la tabla; si era el último, vuelve a empezar. */
  quitar(clave: string): void {
    this._seleccion.update((s) => quitarActivo(s, clave, CATALOGO_EXTERIOR));
    this._graficada.update((s) => quitarActivo(s, clave, CATALOGO_EXTERIOR));
    if (!haySeleccion(this._graficada())) {
      this.restablecer();
    }
  }

  /** «Restablece todo lo seleccionado en la gráfica»: sin selección y con el periodo inicial. */
  restablecer(): void {
    this._seleccion.set(SELECCION_VACIA);
    this._graficada.set(SELECCION_VACIA);
    this._periodo.set(PERIODO_INICIAL_EXTERIOR);
    this._rango.set(SIN_RANGO);
  }

  cambiarPeriodo(periodo: number): void {
    this._periodo.set(periodo);
  }

  cambiarRango(rango: RangoFechas): void {
    this._rango.set(rango);
  }

  // ───────────────────────────── Paneles ─────────────────────────────

  alternarPanel(): void {
    this._panelAbierto.update((a) => !a);
  }

  abrirComparadorMovil(): void {
    this._comparadorMovil.set(true);
  }

  cerrarComparadorMovil(): void {
    this._comparadorMovil.set(false);
  }

  // ───────────────────────────── Asistente ─────────────────────────────

  abrirAsistente(): void {
    this._asistenteAbierto.set(true);
  }

  cerrarAsistente(): void {
    this._asistenteAbierto.set(false);
  }

  /** Mensaje de la persona: queda «Escribiendo» hasta `responderAsistente`. */
  enviarAlAsistente(texto: string): void {
    const limpio = texto.trim();
    if (!limpio || this._pendiente() !== null) {
      return;
    }
    this._mensajes.update((m) => agregarMensaje(m, 'usuario', limpio));
    this._pendiente.set(limpio);
  }

  /** Llega la respuesta fija de ejemplo al último mensaje. */
  responderAsistente(): void {
    const pendiente = this._pendiente();
    if (pendiente === null) {
      return;
    }
    this._mensajes.update((m) => agregarMensaje(m, 'asistente', textoRespuesta(respuestaAsistente(pendiente))));
    this._pendiente.set(null);
  }
}
