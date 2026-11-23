import {
  afterNextRender,
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
import { TEXTOS } from '../../constants/textos';
import { CONTRATOS, TRAMOS } from '../../data/contratos.mock';
import { TipoTramo } from '../../interfaces/contrato';
import { SiNo } from '../../interfaces/conversacion';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { esp, ordenFichas } from '../../utils/calculos';
import { millones, pesos } from '../../utils/formato';
import { etapa1Completa, habilitada, soloLectura } from '../../utils/validaciones';
import { JourneyUiStore } from '../journey-ui.store';

/** Tramo de la barra: los cuatro de retención más «En portafolios cerrados». */
type TipoBarra = TipoTramo | 'cerr';

/** Texto provisional del tooltip de «Descuentos» (Isa enviará el definitivo). */
const TEXTO_DESCUENTOS = 'Incluye las retenciones y el 4×1000 que se descuentan al retirar.';

const CERRADOS = {
  nombre: 'En portafolios cerrados',
  descripcion: 'Certificados a término y otros portafolios que no se pueden retirar hasta su vencimiento.',
};

interface TramoFicha {
  tipo: TipoBarra;
  nombre: string;
  descripcion: string;
  valor: string;
  ancho: string;
  /** Vale $0: se lista igual y en la barra queda como marca mínima de su color. */
  cero: boolean;
}

/** Etapa 2 · Situación: requisitos de pensión y fichas de contrato (del que conviene sacarlo). */
@Component({
  selector: 'nc-etapa-situacion',
  imports: [Icono],
  templateUrl: './etapa-situacion.html',
  styleUrl: './etapa-situacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtapaSituacion {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  protected readonly textoDescuentos = TEXTO_DESCUENTOS;
  /** Distribución por tramos plegada por defecto; al abrirla se ve en todas las fichas a la vez. */
  protected readonly verDist = signal(false);

  // ---- Carrusel de fichas ----
  private readonly pista = viewChild<ElementRef<HTMLElement>>('pista');
  protected readonly puedeIzq = signal(false);
  protected readonly puedeDer = signal(false);
  private readonly rango = signal<[number, number]>([1, 1]);
  protected readonly hayMas = computed(() => this.puedeIzq() || this.puedeDer());
  protected readonly posicion = computed(() => {
    const [a, b] = this.rango();
    const n = this.fichas().length;
    return (a === b ? `${a}` : `${a}–${b}`) + ` de ${n} contratos`;
  });
  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly ver = computed(() => etapa1Completa(this.st()) || this.ro());

  /** Por ahora no se muestra «¿Cumple requisitos de pensión?» (decisión de Isa, 2026-11-23); la lógica queda. */
  private static readonly PREGUNTAR_PENSION = false;
  protected readonly verPension = computed(() => {
    const st = this.st();
    return (
      EtapaSituacion.PREGUNTAR_PENSION &&
      this.ver() &&
      st.motivo !== 'vivienda' &&
      (CONTRATOS.some((c) => c.cc > 0) || !!st.pen)
    );
  });
  protected readonly notaPension = computed(() => {
    const pen = this.st().pen;
    return pen === 'si' ? TEXTOS.penSi : !pen ? TEXTOS.penSinMarca : '';
  });

  protected readonly fichas = computed(() => {
    if (!this.ver()) return [];
    const st = this.st();
    const orden = ordenFichas(st);
    const varias = orden.length > 1;
    const e = esp(st);
    const marcado = st.ctMarc || st.ctConf || orden[0].c.id;
    return orden.map((f, ix) => {
      const c = f.c;
      const k = f.k;
      // Todas las fichas muestran los mismos cinco conceptos, aunque valgan $0 (con condición especial todo es exento)
      const base: [TipoTramo, number][] = e
        ? [['ex', c.ex + c.sr + c.cc], ['sr', 0], ['cc', 0], ['sc', c.sc]]
        : TRAMOS.map((t) => [t.tipo, c[t.tipo]] as [TipoTramo, number]);
      // Portafolios cerrados: lo que no es disponible ni está sin certificar (mismo cálculo que la pestaña Contrato)
      const cerrados = Math.max(0, c.saldo - c.sc - c.disp);
      const valores: [TipoBarra, number][] = [...base, ['cerr', cerrados] as [TipoBarra, number]];
      const tot = valores.reduce((a, t) => a + t[1], 0) || 1;
      const tramos: TramoFicha[] = valores.map(([tipo, v]) => {
        const def = tipo === 'cerr' ? CERRADOS : (TRAMOS.find((t) => t.tipo === tipo) ?? TRAMOS[0]);
        return {
          tipo, nombre: def.nombre, descripcion: def.descripcion, valor: pesos(v),
          // Con valor, proporcional (mínimo 2 % para que se vea); en $0, el CSS le da una marca fija (.jw-barra-cero)
          ancho: v > 0.5 ? Math.max(2, (v / tot) * 100).toFixed(2) + '%' : '',
          cero: v <= 0.5,
        };
      });
      return {
        c, varias, tramos, cubre: k.cubre, marcado: c.id === marcado,
        menor: varias && ix === 0 && k.cubre,
        // Recibe: el monto de Entender (o lo máximo que alcanza); Total: lo que sale del contrato (el disponible si no alcanza)
        recibe: pesos(k.R), descuentos: pesos(k.D - k.R), total: pesos(k.D),
        disp: pesos(c.disp),
        saldo: pesos(c.saldo),
        // Antigüedad y rendimientos generados desde la apertura (incluye los ya retirados): «16 de mar de 2006» → «mar 2006»
        desde: c.desde.replace(/^\d+ de /, '').replace(' de ', ' '),
        generado: millones(c.gan),
        generadoExacto: pesos(c.gan),
      };
    });
  });
  protected readonly ninguno = computed(() =>
    this.ver() && !ordenFichas(this.st()).some((f) => f.k.cubre) ? TEXTOS.ningunoCubre(pesos(this.st().monto)) : null,
  );

  protected elegirPension(v: SiNo): void {
    this.store.elegirPension(v);
  }

  protected marcar(id: string): void {
    this.store.marcarContrato(id);
  }

  constructor() {
    // Recalcula flechas y contador al pintar las fichas y cuando cambia el ancho
    afterRenderEffect(() => {
      this.fichas();
      this.medir();
    });
    afterNextRender(() => {
      const el = this.pista()?.nativeElement;
      if (!el || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => this.medir());
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  private readonly destroyRef = inject(DestroyRef);

  /** Paso del carrusel: ancho de una ficha más el espacio entre fichas. */
  private paso(el: HTMLElement): number {
    const f = el.firstElementChild as HTMLElement | null;
    return f ? f.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '12') : el.clientWidth;
  }

  protected medir(): void {
    const el = this.pista()?.nativeElement;
    if (!el) return;
    this.puedeIzq.set(el.scrollLeft > 2);
    this.puedeDer.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    const p = this.paso(el);
    const n = el.childElementCount;
    const primera = Math.min(n, Math.round(el.scrollLeft / p) + 1);
    const visibles = Math.max(1, Math.floor((el.clientWidth + 2) / p));
    this.rango.set([primera, Math.min(n, primera + visibles - 1)]);
  }

  protected mover(dir: 1 | -1): void {
    const el = this.pista()?.nativeElement;
    if (!el) return;
    const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * this.paso(el), behavior: suave ? 'smooth' : 'auto' });
  }

  protected alternarDist(e: Event): void {
    e.preventDefault(); // está dentro del <label> de la ficha: no debe marcar el contrato
    this.verDist.update((v) => !v);
  }

  protected verDetalle(e: Event, id: string): void {
    e.preventDefault();
    this.ui.abrirDetalle(id, 'contrato');
  }

  protected atras(): void {
    this.store.irEtapa(1);
  }

  /** Continuar: en edición confirma el contrato marcado (y pasa a Opciones); en solo lectura solo avanza. */
  protected siguiente(): void {
    if (this.ro()) {
      if (habilitada(this.st(), 3)) this.store.irEtapa(3);
      return;
    }
    this.store.confirmarContrato();
  }
}
