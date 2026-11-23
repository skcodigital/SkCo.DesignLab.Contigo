import { Pipe, PipeTransform } from '@angular/core';
import { enmascararMontos } from '../utils/montos';

/** `{{ '$53.156.957' | monto: oculto }}`: con el ojo cerrado los montos se ven como "$ ••••••". */
@Pipe({ name: 'monto' })
export class MontoPipe implements PipeTransform {
  transform(texto: string, oculto: boolean): string {
    return oculto ? enmascararMontos(texto) : texto;
  }
}
