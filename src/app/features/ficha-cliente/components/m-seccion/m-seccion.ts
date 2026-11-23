import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

interface Miga {
  readonly texto: string;
  readonly nivel: number;
}

/**
 * Móvil: barra de sección. Dice en qué parte de la ficha está el asesor y la ruta permite subir de nivel.
 * En el prototipo quedó oculta por CSS a pedido de UX (el código queda listo para retomarla).
 */
@Component({
  selector: 'nc-m-seccion',
  templateUrl: './m-seccion.html',
  styleUrl: './m-seccion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MSeccion {
  /** 0 ficha · 1 pestaña · 2 producto · 3 sección del producto. */
  readonly nivel = input.required<number>();
  readonly pestana = input.required<string>();
  readonly producto = input.required<string>();
  readonly seccionProducto = input.required<string>();

  readonly subir = output<number>();

  protected readonly migas = computed<readonly Miga[]>(() => {
    const n = this.nivel();
    const migas: Miga[] = [];
    if (n >= 2) migas.push({ texto: this.pestana() || 'Productos', nivel: 1 });
    if (n === 3) migas.push({ texto: this.producto(), nivel: 2 });
    return migas;
  });

  protected readonly titulo = computed(() => {
    const n = this.nivel();
    return n === 1 ? this.pestana() : n === 2 ? this.producto() : this.seccionProducto();
  });

  protected alSubir(e: Event, nivel: number): void {
    e.preventDefault();
    this.subir.emit(nivel);
  }
}
