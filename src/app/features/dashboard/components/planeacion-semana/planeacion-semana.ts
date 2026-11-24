import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { AvisoStore } from '@core/state/aviso.store';
import { Descarte } from '@core/state/misiones.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { DescartarMisionModal } from '@shared/components/descartar-mision-modal/descartar-mision-modal';
import { TEXTOS } from '../../constants/textos';
import { ID_MISION_OSCAR } from '../../data/misiones.mock';
import { Mision } from '../../interfaces/mision';
import { PlaneacionStore } from '../../state/planeacion.store';
import { primerNombre } from '../../utils/formato';
import { guardarModuloAmplio, leerModuloAmplio } from '../../utils/preferencia-tamano';
import { DianaProgreso } from './diana-progreso/diana-progreso';
import { MisionDestacada } from './mision-destacada/mision-destacada';

/** En el prototipo el módulo no se puede ampliar en pantallas de hasta 600px. */
const MQ_MODULO_COMPACTO = '(max-width: 600px)';

/**
 * Planeación Pro · Tu semana: hasta 5 misiones por semana. Compacto (media columna: la fila abre la misión) o
 * ampliado (ancho completo: lista + misión destacada con acciones). Saldos ocultos al entrar.
 */
@Component({
  selector: 'section[nc-planeacion-semana]',
  imports: [NgTemplateOutlet, DianaProgreso, MisionDestacada, DescartarMisionModal],
  templateUrl: './planeacion-semana.html',
  styleUrl: './planeacion-semana.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlaneacionStore],
  host: {
    id: 'pp-sem',
    class: 'pp-sem pp-oscuro',
    'aria-labelledby': 'pp-tit',
    '[class.amplio]': 'amplio()',
    '[class.oculto]': 'oculto()',
    '[class.lectura]': 'store.lectura()',
  },
})
export class PlaneacionSemana {
  protected readonly store = inject(PlaneacionStore);
  private readonly avisos = inject(AvisoStore);
  private readonly router = inject(Router);

  private readonly movil = injectMediaQuery(MQ_MODULO_COMPACTO);
  /** Preferencia de tamaño (2026-11-18: vuelve la opción de ampliar; se recuerda en este navegador). */
  private readonly prefiereAmplio = signal(leerModuloAmplio());
  /**
   * Sin el botón de ampliar/reducir (2026-11-24): el módulo queda siempre en su versión ampliada.
   * En pantallas de hasta 600px sigue compacto, como en el prototipo.
   */
  protected readonly amplio = computed(() => !this.movil());
  /** Los saldos arrancan ocultos (también al volver al inicio: la vista se crea de nuevo). */
  protected readonly oculto = signal(true);

  protected readonly tam = computed(() => (this.amplio() ? TEXTOS.planeacion.reducir : TEXTOS.planeacion.ampliar));
  protected readonly chip = TEXTOS.planeacion.chip;

  protected readonly modalAbierta = signal(false);
  protected readonly aDescartar = signal<Mision | null>(null);

  protected alternarTamano(): void {
    const amplio = !this.amplio();
    this.prefiereAmplio.set(amplio);
    guardarModuloAmplio(amplio);
  }

  protected clicFila(m: Mision, indice: number): void {
    if (this.amplio()) this.store.seleccionar(indice);
    else this.abrir(m);
  }

  protected clicCompletada(): void {
    this.avisos.mostrar(TEXTOS.avisos.completada);
  }

  /** «Ir a Planeación Pro»: solo la misión de Óscar tiene la conversación completa (Asesoría Pro en su ficha). */
  protected abrir(m: Mision): void {
    if (this.store.lectura()) this.avisos.mostrar(TEXTOS.avisos.soloLectura);
    else if (m.id === ID_MISION_OSCAR) void this.irAFicha('copiloto');
    else this.avisos.mostrar(TEXTOS.avisos.soloConversacionOscar);
  }

  /** El nombre abre la ficha del cliente (Productos). */
  protected verFicha(m: Mision): void {
    if (m.id === ID_MISION_OSCAR) void this.irAFicha('productos');
    else this.avisos.mostrar(TEXTOS.avisos.soloFichaOscar);
  }

  protected abrirDescartar(m: Mision): void {
    this.aDescartar.set(m);
    this.modalAbierta.set(true);
  }

  protected onDescarte(descarte: Descarte): void {
    const m = this.aDescartar();
    if (!m) return;
    this.store.descartar(m.id, descarte);
    this.avisos.mostrar(TEXTOS.avisos.descartada(primerNombre(m.nombre)), () => this.store.restaurar(m.id));
  }

  protected verTodas(e: Event): void {
    e.preventDefault();
    this.avisos.mostrar(TEXTOS.avisos.todasLasMisiones);
  }

  private irAFicha(tab: 'copiloto' | 'productos'): Promise<boolean> {
    return this.router.navigate(['/', RUTAS.ficha], { queryParams: { tab } });
  }
}
