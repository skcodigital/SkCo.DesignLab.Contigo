import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Icono } from '../../components/icono/icono';
import { FUERA_DE_ALCANCE, MOTIVO, TEXTOS } from '../../constants/textos';
import { HOY } from '../../data/conversaciones.mock';
import { Cuando, Motivo, OpcionCuando, PreguntaEntender } from '../../interfaces/conversacion';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { enAlcance } from '../../utils/calculos';
import { iso, masDias, miles, soloDigitos } from '../../utils/formato';
import { etiquetaCuando } from '../../utils/texto-cliente';
import { etapa1Completa, habilitada, soloLectura } from '../../utils/validaciones';
import { JourneyUiStore } from '../journey-ui.store';

const MOTIVOS: readonly Motivo[] = ['liquidez', 'vivienda', 'objetivo', 'rendimientos', 'otro'];
const CUANDOS: readonly (readonly [OpcionCuando, string])[] = [
  ['esta-semana', 'Esta semana'],
  ['este-mes', 'Este mes'],
  ['en-meses', 'En unos meses'],
  ['fecha', 'Con fecha'],
];

/** Etapa 1 · Entender: cuánto, por qué y para cuándo. */
@Component({
  selector: 'nc-etapa-entender',
  imports: [Icono],
  templateUrl: './etapa-entender.html',
  styleUrl: './etapa-entender.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtapaEntender {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  protected readonly motivos = MOTIVOS;
  protected readonly nombreMotivo = MOTIVO;
  protected readonly cuandos = CUANDOS;
  protected readonly textos = TEXTOS;
  protected readonly fechaMin = iso(HOY);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  private readonly enA = computed(() => enAlcance(this.st().motivo));

  /** Texto del monto mientras se escribe (con miles); fuera de foco muestra el guardado. */
  private readonly borrador = signal<string | null>(null);
  protected readonly montoTxt = computed(() => this.borrador() ?? miles(this.st().monto));

  protected readonly motivoAbierto = computed(() => !this.ro() && (!this.enA() || this.st().abierta === 'motivo'));
  protected readonly textoFuera = computed(() => {
    const m = this.st().motivo;
    return m === 'rendimientos' || m === 'otro' ? FUERA_DE_ALCANCE[m] : null;
  });
  protected readonly motivoHecho = computed(() => {
    const st = this.st();
    if (!st.motivo || !(this.ro() || (this.enA() && st.abierta !== 'motivo'))) return null;
    return st.motivo === 'otro' && this.ro() && st.otro.trim() ? 'Otro: ' + st.otro.trim() : MOTIVO[st.motivo];
  });
  private readonly verCuando = computed(() => this.enA() && this.st().monto > 0 && !!this.st().cuando);
  protected readonly cuandoHecho = computed(() =>
    this.verCuando() && (this.ro() || this.st().abierta !== 'cuando') ? etiquetaCuando(this.st()) : null,
  );
  protected readonly cuandoAbierto = computed(() => !this.ro() && this.verCuando() && this.st().abierta === 'cuando');
  protected readonly cuandoMarcado = computed<OpcionCuando | null>(() => {
    const st = this.st();
    if (st.eligeFecha) return 'fecha';
    if (st.cuando === 'en-meses') return st.fechaTipo === 'fecha' ? 'fecha' : 'en-meses';
    return st.cuando;
  });
  protected readonly fecha = signal('');
  protected readonly verVivienda = computed(
    () => this.st().motivo === 'vivienda' && etapa1Completa(this.st()) && this.st().abierta !== 'motivo',
  );
  protected readonly verPie = computed(() => etapa1Completa(this.st()) || this.ro());

  private readonly inputMonto = viewChild.required<ElementRef<HTMLInputElement>>('monto');
  private readonly preguntas = viewChild<ElementRef<HTMLElement>>('pregunta');
  private readonly inputFecha = viewChild<ElementRef<HTMLInputElement>>('fechaInput');
  /** Pregunta a enfocar después de «Cambiar» / campo de fecha al elegir «Con fecha». */
  private readonly enfocar = signal<'pregunta' | 'fecha' | null>(null);
  private focoAtendido = this.ui.focoMonto();

  constructor() {
    afterRenderEffect(() => {
      const pedido = this.ui.focoMonto();
      if (pedido === this.focoAtendido) return;
      this.focoAtendido = pedido;
      const el = this.inputMonto().nativeElement;
      el.focus();
      el.select();
    });
    afterRenderEffect(() => {
      const objetivo = this.enfocar();
      if (!objetivo) return;
      if (objetivo === 'fecha') this.inputFecha()?.nativeElement.focus();
      else this.preguntas()?.nativeElement.focus({ preventScroll: true });
      this.enfocar.set(null);
    });
    // Al cerrar el journey con el monto en edición, se guarda (como `cerrar()` del prototipo)
    inject(DestroyRef).onDestroy(() => {
      if (this.borrador() !== null) this.guardarMonto();
    });
  }

  protected escribirMonto(e: Event): void {
    const input = e.target as HTMLInputElement;
    const txt = miles(soloDigitos(input.value));
    input.value = txt;
    this.borrador.set(txt);
  }

  protected guardarMonto(): void {
    const txt = this.borrador();
    if (txt === null) return;
    this.borrador.set(null);
    this.store.definirMonto(soloDigitos(txt));
  }

  protected teclaMonto(e: Event): void {
    e.preventDefault();
    this.guardarMonto();
  }

  protected elegirMotivo(m: Motivo): void {
    this.store.elegirMotivo(m);
  }

  protected anotarFuera(e: Event): void {
    this.store.anotarMotivoFuera((e.target as HTMLTextAreaElement).value);
  }

  protected cerrarFuera(): void {
    this.store.cerrarFueraDeAlcance();
    this.ui.toast('info', ...TEXTOS.toastFuera);
  }

  protected cambiar(q: PreguntaEntender): void {
    this.store.cambiar(q);
    this.enfocar.set('pregunta');
  }

  protected elegirCuando(v: OpcionCuando): void {
    if (v === 'fecha') {
      const st = this.st();
      this.fecha.set(st.cuando === 'en-meses' && st.fecha ? st.fecha : iso(masDias(91)));
      this.store.abrirFecha();
      this.enfocar.set('fecha');
      return;
    }
    this.store.elegirCuando(v as Cuando);
  }

  protected leerFecha(e: Event): void {
    this.fecha.set((e.target as HTMLInputElement).value);
  }

  protected confirmarFecha(): void {
    if (this.fecha()) this.store.confirmarFecha(this.fecha());
  }

  protected continuar(): void {
    if (habilitada(this.st(), 2)) this.store.irEtapa(2);
  }
}
