import { computed, Injectable, signal } from '@angular/core';
import { PestanaFichaId, PestanaProductoId } from '../interfaces/pestanas';
import { PESTANA_POR_DEFECTO, PESTANAS_FICHA, PESTANAS_PRODUCTO } from '../constants/pestanas';
import { panelDePestana } from '../utils/pestanas';

/**
 * Estado-cliente de la ficha de Óscar mientras el asesor está dentro de ella (ficha + ficha de producto).
 * Se provee en el layout de la ficha: al salir de la ficha se descarta. Cero I/O.
 */
@Injectable()
export class FichaStore {
  private readonly _pestana = signal<PestanaFichaId>(PESTANA_POR_DEFECTO);
  private readonly _pestanaProducto = signal<PestanaProductoId>('composicion');
  private readonly _saldosOcultos = signal(false);
  private readonly _kpisAmpliados = signal(false);

  readonly pestana = this._pestana.asReadonly();
  readonly pestanaProducto = this._pestanaProducto.asReadonly();
  readonly saldosOcultos = this._saldosOcultos.asReadonly();
  readonly kpisAmpliados = this._kpisAmpliados.asReadonly();

  readonly panel = computed(() => panelDePestana(this._pestana()));
  readonly enMision = computed(() => this._pestana() === 'copiloto');
  readonly etiquetaPestana = computed(
    () => PESTANAS_FICHA.find((p) => p.id === this._pestana())?.etiqueta ?? '',
  );
  readonly etiquetaPestanaProducto = computed(
    () => PESTANAS_PRODUCTO.find((p) => p.id === this._pestanaProducto())?.etiqueta ?? '',
  );

  abrirPestana(id: PestanaFichaId): void {
    this._pestana.set(id);
  }

  /** Móvil: la flecha verde sale de una pestaña abierta como pantalla aparte y vuelve a Productos. */
  volverAProductos(): void {
    this._pestana.set(PESTANA_POR_DEFECTO);
  }

  abrirSeccionProducto(id: PestanaProductoId): void {
    this._pestanaProducto.set(id);
  }

  alternarSaldos(): void {
    this._saldosOcultos.update((v) => !v);
  }

  alternarAmpliado(): void {
    this._kpisAmpliados.update((v) => !v);
  }
}
