import { ChangeDetectionStrategy, Component, input, linkedSignal, output, signal } from '@angular/core';
import { Casillas } from '@features/monitor/components/comunes/casillas/casillas';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Popover } from '@features/monitor/components/comunes/popover/popover';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { GrupoCasillas, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/**
 * «Filtrar» de la pestaña Portafolios (`app-filter`): popover con las categorías y los productos del cliente, el
 * interruptor «Seleccionar todo» y «Aplicar», que avisa lo marcado (vacío = todos). Cuando cambian las opciones
 * vuelve a empezar sin nada marcado, como el formulario de producción.
 */
@Component({
  selector: 'nc-mon-filtro-portafolios',
  imports: [Casillas, Icono, Popover],
  templateUrl: './filtro-portafolios.html',
  styleUrl: './filtro-portafolios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltroPortafolios {
  readonly grupos = input<readonly GrupoCasillas[]>([]);
  readonly filtrar = output<string[]>();

  protected readonly textos = TEXTOS_CLIENTE.filtro;
  protected readonly abierto = signal(false);
  protected readonly valores = linkedSignal<ValoresCasillas>(() =>
    Object.fromEntries(this.grupos().flatMap((g) => g.opciones.map((o) => [o.valor, false]))),
  );
  protected readonly todos = linkedSignal({ source: this.grupos, computation: () => false });

  protected alternarTodos(): void {
    const marcar = !this.todos();
    this.valores.update((v) => Object.fromEntries(Object.keys(v).map((k) => [k, marcar])));
    this.todos.set(marcar);
  }

  protected aplicar(): void {
    this.filtrar.emit(
      Object.entries(this.valores())
        .filter(([, marcado]) => marcado)
        .map(([valor]) => valor),
    );
    this.abierto.set(false);
  }
}
