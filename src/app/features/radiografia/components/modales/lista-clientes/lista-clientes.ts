import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { Dialogo } from '@features/radiografia/components/comunes/dialogo/dialogo';
import { TEXTOS } from '@features/radiografia/constants/textos';
import { FiltroLista } from '@features/radiografia/interfaces/lista';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { armarLista, filtrarFilas, totalLista } from '@features/radiografia/utils/listas';

/** Panel lateral: de la cifra al listado de clientes (patrón "Filtrar" de Contigo). */
@Component({
  selector: 'nc-rx-lista-clientes',
  imports: [Dialogo],
  templateUrl: './lista-clientes.html',
  styleUrl: './lista-clientes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaClientes {
  protected readonly store = inject(RadiografiaStore);

  protected readonly lista = computed(() => {
    const clave = this.store.lista();
    return clave ? armarLista(clave, this.store.vista(), this.store.plan()) : null;
  });
  protected readonly filtro = linkedSignal<FiltroLista>(() => this.lista()?.filtroInicial ?? 'todos');
  protected readonly filas = computed(() => {
    const l = this.lista();
    return l ? filtrarFilas(l, this.filtro()) : [];
  });
  protected readonly mas = computed(() => {
    const l = this.lista();
    if (!l) return '';
    const total = totalLista(l, this.filtro());
    const n = this.filas().length;
    return total - n > 0 ? TEXTOS.lista.mostrando(n, total) : '';
  });

  protected cambiarFiltro(f: FiltroLista): void {
    this.filtro.set(f);
  }
}
