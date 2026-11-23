import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { Descarte, MisionesStore, textoMotivo } from '@core/state/misiones.store';
import { UiStore } from '@core/state/ui.store';
import { guardarSesion, leerSesion } from '@core/utils/safe-storage';
import { DescartarMisionModal } from '@shared/components/descartar-mision-modal/descartar-mision-modal';
import { TEXTOS } from '../../constants/textos';
import { CLIENTE, HOY } from '../../data/conversaciones.mock';
import { Journey } from '../../journey/journey';
import { JourneyCarga } from '../../journey/journey-carga/journey-carga';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { fechaCorta } from '../../utils/formato';
import { CopCabecera, VistaPlaneacion } from '../cop-cabecera/cop-cabecera';
import { CopHistorial } from '../cop-historial/cop-historial';
import { CopOtras } from '../cop-otras/cop-otras';
import { Icono } from '../icono/icono';

/** Solo la primera vez que se abre Planeación Pro en la sesión se muestra el loading introductorio. */
const INTRO_VISTA_KEY = 'nc-asesoria-intro';
const INTRO_MS = 1350;
const INTRO_CORTA_MS = 400;

type Fase = 'cerrado' | 'cargando' | 'abierto';

/**
 * Pestaña «Planeación Pro» (`copiloto`) de la ficha en modo misión: misión de Óscar (señal de Dali Oportunidades),
 * otras conversaciones, historial y el journey «Acompañamiento al retirar».
 */
@Component({
  selector: 'nc-copiloto-panel',
  imports: [CopCabecera, CopOtras, CopHistorial, Icono, DescartarMisionModal, JourneyCarga, Journey],
  templateUrl: './copiloto-panel.html',
  styleUrl: './copiloto-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopilotoPanel {
  private readonly store = inject(ConversacionesStore);
  private readonly misiones = inject(MisionesStore);
  private readonly aviso = inject(AvisoStore);
  private readonly ui = inject(UiStore);

  protected readonly nombre = CLIENTE.nombre;
  protected readonly senal = CLIENTE.senal;
  protected readonly textos = TEXTOS;

  // ---- Loading introductorio (clases `intro` / `revela`) ----
  protected readonly intro = signal(false);
  protected readonly revela = signal(false);

  // ---- Vista y misión ----
  protected readonly vista = signal<VistaPlaneacion>('journeys');
  protected readonly gestionada = this.store.gestionada;
  protected readonly enCurso = this.store.misionEnCurso;
  protected readonly descarte = computed(() => this.misiones.descartes()[CLIENTE.id] ?? null);
  protected readonly motivoDescarte = computed(() => {
    const d = this.descarte();
    return d ? textoMotivo(d) || TEXTOS.sinMotivo : '';
  });
  protected readonly verTarjeta = computed(() => !this.gestionada() && !this.descarte());
  protected readonly estadoMision = computed(() => TEXTOS.misionEnCurso(this.store.etapasMision()));
  protected readonly ultima = computed(() => (this.store.hayNuevas() ? fechaCorta(HOY) : CLIENTE.ultima));
  protected readonly hechas = computed(() => (this.gestionada() ? 1 : 0));
  protected readonly historial = this.store.historial;

  protected readonly descartarAbierta = signal(false);
  private avisoDescarte: number | null = null;

  // ---- Journey ----
  protected readonly fase = signal<Fase>('cerrado');

  constructor() {
    const destroyRef = inject(DestroyRef);
    if (leerSesion(INTRO_VISTA_KEY) === '1') {
      this.revela.set(true);
    } else {
      guardarSesion(INTRO_VISTA_KEY, '1');
      const corto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.intro.set(true);
      this.ui.set('cop-cargando', true);
      const t = setTimeout(() => {
        this.intro.set(false);
        this.ui.set('cop-cargando', false);
        this.revela.set(true);
      }, corto ? INTRO_CORTA_MS : INTRO_MS);
      destroyRef.onDestroy(() => clearTimeout(t));
    }
    destroyRef.onDestroy(() => this.ui.set('cop-cargando', false));
  }

  protected abrirMision(): void {
    if (this.fase() !== 'cerrado') return;
    this.store.abrirMision();
    this.fase.set('cargando');
  }

  protected abrirCatalogo(): void {
    if (this.fase() !== 'cerrado') return;
    this.store.abrirCatalogo();
    this.fase.set('cargando');
  }

  protected abrirHistorial(id: number): void {
    if (this.fase() !== 'cerrado') return;
    this.store.abrirConversacion(id);
    this.fase.set('cargando');
  }

  protected cerrarJourney(segundos: number): void {
    this.store.cerrarJourney(segundos);
    this.fase.set('cerrado');
  }

  protected pedirDescarte(e: Event): void {
    e.stopPropagation();
    this.descartarAbierta.set(true);
  }

  protected descartar(d: Descarte): void {
    this.misiones.descartar(CLIENTE.id, d);
    this.aviso.mostrar(TEXTOS.avisoDescarte(CLIENTE.nombre), () => this.misiones.restaurar(CLIENTE.id));
    this.avisoDescarte = this.aviso.actual()?.id ?? null;
  }

  /** «Deshacer» de la caja: usa el del aviso si sigue visible; si no, restaura la misión. */
  protected deshacerDescarte(): void {
    if (this.avisoDescarte !== null && this.aviso.actual()?.id === this.avisoDescarte) this.aviso.deshacer();
    else this.misiones.restaurar(CLIENTE.id);
    this.avisoDescarte = null;
  }
}
