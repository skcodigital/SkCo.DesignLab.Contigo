import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { BarrasEdad } from '@features/radiografia/components/con-pac/clientes-comun/barras-edad/barras-edad';
import { DonaSegmentos } from '@features/radiografia/components/con-pac/clientes-comun/dona-segmentos/dona-segmentos';
import { Icono } from '@features/radiografia/components/con-pac/clientes-comun/icono/icono';
import { ParesClientes } from '@features/radiografia/components/con-pac/clientes-comun/pares-clientes/pares-clientes';
import { ProductosCliente } from '@features/radiografia/components/con-pac/clientes-comun/productos-cliente/productos-cliente';
import {
  alertaEvolucion,
  alertaProductos,
  TEXTOS_CLIENTES,
} from '@features/radiografia/constants/textos-clientes';
import { AMBITOS, MONOPRODUCTO_FP_ASIGNADO } from '@features/radiografia/data/clientes.mock';
import { Ambito } from '@features/radiografia/interfaces/radiografia';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { pctDosOMas } from '@features/radiografia/utils/graficas-clientes';

let siguiente = 0;

/**
 * C-03 / C-05: recuadros de Clientes (evolución, productos por cliente, segmento y edad), cada uno con
 * su selector Skandia | Agencia Norte. Lo comparten el director y el FP Asignado.
 */
@Component({
  selector: 'nc-rx-clientes-ambitos',
  imports: [ParesClientes, ProductosCliente, DonaSegmentos, BarrasEdad, Icono],
  templateUrl: './clientes-ambitos.html',
  styleUrl: './clientes-ambitos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesAmbitos {
  protected readonly store = inject(RadiografiaStore);

  /** Vista que los muestra: cambia el texto del botón "1 producto" y la posición del tag. */
  readonly vista = input<'director' | 'dueno'>('director');
  /** Sufijo de los ids (`-own` en la vista del FP Asignado). */
  readonly sufijo = input('');

  protected readonly textos = TEXTOS_CLIENTES;
  /** Nombre único de los grupos de radios. */
  protected readonly grupo = 'ambito-' + ++siguiente;

  protected readonly ambitoEvol = signal<Ambito>('skandia');
  protected readonly ambitoProd = signal<Ambito>('skandia');
  protected readonly ambitoSeg = signal<Ambito>('skandia');
  protected readonly ambitoEdad = signal<Ambito>('skandia');

  protected readonly evol = computed(() => AMBITOS[this.ambitoEvol()]);
  protected readonly prod = computed(() => AMBITOS[this.ambitoProd()]);
  protected readonly seg = computed(() => AMBITOS[this.ambitoSeg()]);
  protected readonly edad = computed(() => AMBITOS[this.ambitoEdad()]);

  protected readonly alertaEvol = computed(() => alertaEvolucion(this.ambitoEvol(), this.evol()));
  protected readonly alertaProd = computed(() =>
    alertaProductos(this.ambitoProd(), this.prod(), MONOPRODUCTO_FP_ASIGNADO),
  );
  protected readonly dosOMas = computed(() => pctDosOMas(this.prod().prod, this.prod().total));
  protected readonly aria1p = computed(() => TEXTOS_CLIENTES.aria1p[this.vista()]);
}
