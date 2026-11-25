import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { Buscador } from '@features/monitor/components/comunes/buscador/buscador';
import { CasillasTarjeta } from '@features/monitor/components/comunes/casillas-tarjeta/casillas-tarjeta';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Seleccion } from '@features/monitor/components/comunes/seleccion/seleccion';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { FondoComparable } from '@features/monitor/interfaces/cliente';
import { ValoresCasillas } from '@features/monitor/interfaces/comunes';
import {
  fondosVisibles,
  grupoFondos,
  opcionesFiltroFondos,
  seleccionFondos,
  valoresFondos,
} from '@features/monitor/utils/cliente-fondos';

/**
 * «Portafolios SK» del panel «Comparar»: listas de clasificación y perfil, interruptor de desactualizados,
 * buscador y una tarjeta por portafolio. Lo marcado vive en `seleccionados` (claves en el orden en que se
 * marcaron).
 */
@Component({
  selector: 'nc-mon-comparar-fondos',
  imports: [Buscador, CasillasTarjeta, Icono, Seleccion, Tooltip],
  templateUrl: './comparar-fondos.html',
  styleUrl: './comparar-fondos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompararFondos {
  readonly fondos = input<readonly FondoComparable[]>([]);
  readonly seleccionados = model<readonly string[]>([]);
  readonly hoy = input<Date>(new Date());

  protected readonly clasificacion = signal('');
  protected readonly perfil = signal('');
  protected readonly mostrarInactivos = signal(false);
  protected readonly termino = signal('');

  protected readonly clasificaciones = computed(() =>
    opcionesFiltroFondos(this.fondos(), 'clasificacion', TEXTOS_CLIENTE.comparar.clasificacion),
  );
  protected readonly perfiles = computed(() => opcionesFiltroFondos(this.fondos(), 'perfil', TEXTOS_CLIENTE.comparar.perfil));

  protected readonly grupo = computed(() =>
    grupoFondos(
      fondosVisibles(
        this.fondos(),
        { clasificacion: this.clasificacion(), perfil: this.perfil(), mostrarInactivos: this.mostrarInactivos() },
        this.hoy(),
      ),
      this.hoy(),
    ),
  );
  protected readonly valores = computed(() => valoresFondos(this.seleccionados()));

  protected marcar(valores: ValoresCasillas): void {
    this.seleccionados.set(seleccionFondos(this.seleccionados(), valores));
  }
}
