import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { UiStore } from '@core/state/ui.store';
import { Icono } from '../components/icono/icono';
import { ESTADO_CONV, PARTES, TEXTOS } from '../constants/textos';
import { etiquetaContrato } from '../data/contratos.mock';
import { CLIENTE } from '../data/conversaciones.mock';
import { Etapa } from '../interfaces/conversacion';
import { ConversacionesStore } from '../state/conversaciones.store';
import { ctSel, enAlcance } from '../utils/calculos';
import { deIso, fCorta, pesos } from '../utils/formato';
import { completa, ETAPAS, habilitada, soloLectura } from '../utils/validaciones';
import { DetallePanel } from './detalle/detalle-panel';
import { EtapaAcuerdo } from './etapa-acuerdo/etapa-acuerdo';
import { EtapaEntender } from './etapa-entender/etapa-entender';
import { EtapaOpciones } from './etapa-opciones/etapa-opciones';
import { EtapaSituacion } from './etapa-situacion/etapa-situacion';
import { JourneyUiStore } from './journey-ui.store';
import { Resumen } from './resumen/resumen';

/**
 * Journey «Acompañamiento al retirar» (v5, cuatro partes) a pantalla del área de contenido: conserva header y menú
 * lateral. Al abrir pone `jw-abierto` y bloquea el scroll de la página; al cerrar emite los segundos que estuvo abierto.
 */
@Component({
  selector: 'nc-journey',
  imports: [Icono, Resumen, EtapaEntender, EtapaSituacion, EtapaOpciones, EtapaAcuerdo, DetallePanel],
  templateUrl: './journey.html',
  styleUrl: './journey.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JourneyUiStore],
  host: {
    '(document:keydown.escape)': 'escape()',
    '(window:resize)': 'encajar()',
  },
})
export class Journey {
  private readonly store = inject(ConversacionesStore);
  private readonly uiPagina = inject(UiStore);
  private readonly doc = inject(DOCUMENT);
  protected readonly ui = inject(JourneyUiStore);

  /** Segundos que estuvo abierto. */
  readonly cerrar = output<number>();

  protected readonly textos = TEXTOS;
  protected readonly titulo = `${TEXTOS.tituloJourney} · ${CLIENTE.nombre}`;
  /** Título centrado bajo el encabezado «Salir · Acompañamiento al retirar · …», encima de los pasos. */
  protected readonly intro = TEXTOS.introJourney;
  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  private readonly etapa = computed(() => this.st().etapa);
  protected readonly parteActual = computed(() => PARTES[this.etapa() - 1]);
  protected readonly estadoConv = computed(() => ESTADO_CONV[this.st().estado]);

  protected readonly pasos = computed(() => {
    const st = this.st();
    return ETAPAS.map((n) => {
      const on = st.etapa === n;
      const ok = completa(st, n);
      return {
        n, on, ok, nombre: PARTES[n - 1],
        deshabilitado: on || !habilitada(st, n),
        sr: on ? TEXTOS.pasoActual : ok ? TEXTOS.pasoCompleta : TEXTOS.pasoPendiente,
      };
    });
  });

  // Barra de contexto (pantallas angostas)
  protected readonly ctxMonto = computed(() => enAlcance(this.st().motivo) && this.st().monto > 0);
  protected readonly montoTxt = computed(() => pesos(this.st().monto));
  protected readonly contratoTxt = computed(() => {
    const c = ctSel(this.st());
    return etiquetaContrato(c);
  });

  protected readonly cierreAviso = computed(() => {
    const st = this.st();
    if (!st.cerrado || (st.estado !== 'cerrada-seguimiento' && st.estado !== 'finalizada')) return null;
    return st.estado === 'finalizada'
      ? { resultado: st.resultado ?? '', texto: '' }
      : { resultado: null, texto: TEXTOS.cierreSeguimiento(fCorta(deIso(st.segHasta))) };
  });

  /** Borde inferior del header del shell (en móvil su alto varía): `--jw-top`. */
  protected readonly top = signal<string | null>(null);

  private readonly velo = viewChild.required<ElementRef<HTMLElement>>('velo');
  private readonly modal = viewChild.required<ElementRef<HTMLElement>>('modal');
  private readonly scroll = viewChild.required<ElementRef<HTMLElement>>('scroll');
  private readonly salir = viewChild.required<ElementRef<HTMLButtonElement>>('salir');
  private readonly abiertoDesde = Date.now();

  constructor() {
    // «Salir» desde una etapa (p. ej. tras finalizar fuera de alcance): cierra el journey como «Salir» del encabezado
    let salirAtendido = this.ui.salir();
    afterRenderEffect(() => {
      const pedido = this.ui.salir();
      if (pedido === salirAtendido) return;
      salirAtendido = pedido;
      this.cerrarJourney();
    });
    this.uiPagina.set('jw-abierto', true);
    const body = this.doc.body;
    body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => {
      this.uiPagina.set('jw-abierto', false);
      body.style.overflow = '';
      this.ui.limpiar();
    });
    afterNextRender(() => {
      this.encajar();
      this.salir().nativeElement.focus();
    });
    // Cada cambio de etapa vuelve arriba
    afterRenderEffect(() => {
      this.etapa();
      this.scroll().nativeElement.scrollTop = 0;
      this.modal().nativeElement.scrollTop = 0;
    });
  }

  protected irEtapa(n: Etapa): void {
    if (habilitada(this.st(), n)) this.store.irEtapa(n);
  }

  protected editarMonto(): void {
    this.store.irEtapa(1);
    this.ui.pedirFocoMonto();
  }

  protected cerrarJourney(): void {
    this.cerrar.emit(Math.round((Date.now() - this.abiertoDesde) / 1000));
  }

  protected clicVelo(e: MouseEvent): void {
    if (e.target === this.velo().nativeElement) this.cerrarJourney();
  }

  protected escape(): void {
    if (!this.ui.detalle()) this.cerrarJourney();
  }

  /** Mide el header del shell para ocupar solo el área de contenido (solo medida, como `encajar()` del prototipo). */
  protected encajar(): void {
    const h = this.doc.querySelector('header');
    this.top.set(h ? Math.max(0, Math.round(h.getBoundingClientRect().bottom)) + 'px' : null);
  }
}
