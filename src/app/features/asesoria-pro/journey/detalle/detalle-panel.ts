import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Icono } from '../../components/icono/icono';
import { CONTRATOS, contratoPorId, etiquetaContrato } from '../../data/contratos.mock';
import { DetalleAbierto, JourneyUiStore, TabDetalle } from '../journey-ui.store';
import { TabAportes } from './tab-aportes/tab-aportes';
import { TabCalculo } from './tab-calculo/tab-calculo';
import { TabContrato } from './tab-contrato/tab-contrato';
import { TabCredito } from './tab-credito/tab-credito';
import { TabImpuestos } from './tab-impuestos/tab-impuestos';
import { TabPortafolios } from './tab-portafolios/tab-portafolios';

interface Pestana {
  id: TabDetalle;
  nombre: string;
}

const PESTANAS: readonly Pestana[] = [
  { id: 'contrato', nombre: 'Contrato' },
  { id: 'portafolios', nombre: 'Portafolios' },
  { id: 'aportes', nombre: 'Aportes' },
  { id: 'calculo', nombre: 'Cálculo' },
  { id: 'credito', nombre: 'Crédito' },
  { id: 'impuestos', nombre: 'Impuestos' },
];

const POR_DEFECTO: DetalleAbierto = { ct: CONTRATOS[0].id, tab: 'contrato' };

/**
 * Panel de detalle del journey (Contrato · Portafolios · Aportes · Cálculo · Crédito · Impuestos).
 * Sale por encima de todo (header y menú incluidos); Escape lo cierra sin cerrar el journey.
 */
@Component({
  selector: 'nc-detalle-panel',
  imports: [Icono, TabContrato, TabPortafolios, TabAportes, TabCalculo, TabCredito, TabImpuestos],
  templateUrl: './detalle-panel.html',
  styleUrl: './detalle-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetallePanel {
  protected readonly ui = inject(JourneyUiStore);

  protected readonly contratos = CONTRATOS;
  protected readonly etiqueta = etiquetaContrato;
  protected readonly pestanas = PESTANAS;
  protected readonly det = computed(() => this.ui.detalle() ?? POR_DEFECTO);
  protected readonly contrato = computed(() => contratoPorId(this.det().ct));

  private readonly cerrarBtn = viewChild.required<ElementRef<HTMLButtonElement>>('cerrarBtn');
  private readonly cuerpo = viewChild.required<ElementRef<HTMLElement>>('cuerpo');
  private readonly tabBtns = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');
  /** Elemento que tenía el foco al abrir (se le devuelve al cerrar). */
  private readonly volverA = document.activeElement as HTMLElement | null;

  constructor() {
    afterNextRender(() => this.cerrarBtn().nativeElement.focus());
    // Al cambiar de pestaña o de contrato el cuerpo vuelve arriba
    afterRenderEffect(() => {
      const d = this.det();
      if (d) this.cuerpo().nativeElement.scrollTop = 0;
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.volverA?.isConnected) this.volverA.focus();
    });
  }

  protected cerrar(): void {
    this.ui.cerrarDetalle();
  }

  protected escape(e: Event): void {
    e.stopPropagation();
    this.cerrar();
  }

  protected elegirContrato(e: Event): void {
    this.ui.elegirContratoDetalle((e.target as HTMLSelectElement).value);
  }

  protected elegirTab(tab: TabDetalle): void {
    this.ui.elegirTabDetalle(tab);
  }

  /** Flechas izquierda/derecha entre pestañas. */
  protected navegar(e: KeyboardEvent): void {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = PESTANAS.findIndex((t) => t.id === this.det().tab);
    const n = (i + (e.key === 'ArrowRight' ? 1 : PESTANAS.length - 1)) % PESTANAS.length;
    this.ui.elegirTabDetalle(PESTANAS[n].id);
    this.tabBtns()[n]?.nativeElement.focus();
  }
}
