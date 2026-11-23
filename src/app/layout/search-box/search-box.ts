import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { RECIENTES, ResultadoBusqueda, TipoResultado } from '../data/busqueda';
import { coincide, resaltar, TrozosResaltado } from '../utils/busqueda';

interface ResultadoVisible extends ResultadoBusqueda {
  trozos: TrozosResaltado;
}

/**
 * Buscador global del header (estilos del buscador de Casosia): al enfocar muestra qué se puede buscar y
 * los recientes; al escribir filtra y resalta. Óscar abre su ficha y Empresa ABC su radiografía.
 */
@Component({
  selector: 'nc-search-box',
  templateUrl: './search-box.html',
  styleUrl: './search-box.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBox {
  private readonly router = inject(Router);

  protected readonly Empresa = TipoResultado.Empresa;
  protected readonly consulta = signal('');
  /** Cerrado explícito (Escape o elegir un resultado); se reabre al enfocar o escribir. */
  protected readonly cerrado = signal(false);
  protected readonly hayConsulta = computed(() => this.consulta().trim() !== '');
  protected readonly resultados = computed<ResultadoVisible[]>(() => {
    const q = this.consulta();
    return RECIENTES.filter((r) => coincide(r, q)).map((r) => ({ ...r, trozos: resaltar(r.titulo, q) }));
  });

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly opciones = viewChildren<ElementRef<HTMLButtonElement>>('opcion');

  protected escribir(e: Event): void {
    this.consulta.set((e.target as HTMLInputElement).value);
    this.cerrado.set(false);
  }

  protected limpiar(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.consulta.set('');
    this.cerrado.set(false);
    this.input().nativeElement.focus();
  }

  protected elegir(r: ResultadoBusqueda, e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.consulta.set('');
    this.cerrado.set(true);
    (e.currentTarget as HTMLElement).blur();
    this.input().nativeElement.blur();
    void this.router.navigateByUrl(r.ruta);
  }

  /** Clic en el desplegable fuera de un resultado: no roba el foco ni reenfoca el input del label. */
  protected noRobarFoco(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('.sd-res')) e.preventDefault();
  }

  protected teclado(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.cerrado.set(true);
      this.input().nativeElement.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const vis = this.opciones().map((o) => o.nativeElement);
    if (!vis.length) return;
    e.preventDefault();
    const i = vis.indexOf(document.activeElement as HTMLButtonElement);
    const j = e.key === 'ArrowDown' ? (i < 0 ? 0 : Math.min(i + 1, vis.length - 1)) : i <= 0 ? -1 : i - 1;
    (j < 0 ? this.input().nativeElement : vis[j]).focus();
  }
}
