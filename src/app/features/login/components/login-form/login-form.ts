import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { validarLogin } from '../../utils/validaciones';
import { CampoFlotante } from '../campo-flotante/campo-flotante';

/**
 * Zona para Asesores Independientes de Seguros: correo + contraseña.
 * Errores como Portal Clientes: campo vacío, correo no válido y «Datos incorrectos»
 * (en el prototipo la contraseña es incorrecta si tiene menos de 8 caracteres).
 */
@Component({
  selector: 'form[nc-login-form]',
  imports: [CampoFlotante],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { novalidate: '', '(submit)': 'enviar($event)' },
})
export class LoginForm {
  readonly ingresar = output<void>();
  /** «¿Olvidaste tu contraseña?» */
  readonly olvido = output<void>();

  protected readonly correo = signal('');
  protected readonly clave = signal('');
  protected readonly errorCorreo = signal<string | null>(null);
  protected readonly errorClave = signal<string | null>(null);
  protected readonly datosIncorrectos = signal(false);

  private readonly campoCorreo = viewChild.required<CampoFlotante>('campoCorreo');
  private readonly campoClave = viewChild.required<CampoFlotante>('campoClave');
  private readonly enlaceOlvido = viewChild.required<ElementRef<HTMLAnchorElement>>('enlaceOlvido');

  /** Al cerrar el restablecimiento el foco vuelve al enlace que lo abrió. */
  enfocarOlvido(): void {
    this.enlaceOlvido().nativeElement.focus();
  }

  protected escribirCorreo(valor: string): void {
    this.correo.set(valor);
    this.errorCorreo.set(null);
    this.datosIncorrectos.set(false);
  }

  protected escribirClave(valor: string): void {
    this.clave.set(valor);
    this.errorClave.set(null);
    this.datosIncorrectos.set(false);
  }

  protected abrirOlvido(e: Event): void {
    e.preventDefault();
    this.olvido.emit();
  }

  protected enviar(e: Event): void {
    e.preventDefault();
    this.datosIncorrectos.set(false);
    const r = validarLogin(this.correo(), this.clave());
    this.errorCorreo.set(r.errorCorreo);
    this.errorClave.set(r.errorClave);
    if (r.errorCorreo) return this.campoCorreo().enfocar();
    if (r.errorClave) return this.campoClave().enfocar();
    if (r.datosIncorrectos) return this.datosIncorrectos.set(true);
    this.ingresar.emit();
  }
}
