import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { TEXTOS_LOGIN, TIEMPOS_LOGIN } from '../../constants/textos';
import { REGLAS_CLAVE } from '../../data/login.mock';
import { PasoReset, ResetPasswordStore, TOTAL_PASOS } from '../../state/reset-password.store';
import { limpiarCodigo } from '../../utils/validaciones';
import { CampoFlotante } from '../campo-flotante/campo-flotante';
import { ResetCargando } from '../reset-cargando/reset-cargando';

/**
 * Restablecer contraseña (Zona Independientes de Seguros), mismo flujo de Portal Clientes:
 * correo → (cargando) → código con vencimiento de 5:00 → nueva contraseña → (cargando) → ingresa.
 */
@Component({
  selector: 'div[nc-reset-password]',
  imports: [CampoFlotante, ResetCargando],
  providers: [ResetPasswordStore],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  /** «Regresar» desde el paso 1. */
  readonly cerrar = output<void>();
  /** Contraseña guardada: entra al portal. */
  readonly completado = output<void>();

  protected readonly store = inject(ResetPasswordStore);
  protected readonly pasos = Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1);
  protected readonly reglas = REGLAS_CLAVE;
  protected readonly limpiarCodigo = limpiarCodigo;

  private readonly campoCorreo = viewChild<CampoFlotante>('campoCorreo');
  private readonly campoCodigo = viewChild<CampoFlotante>('campoCodigo');
  private carga: ReturnType<typeof setTimeout> | undefined;
  private reloj: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.carga);
      this.detenerReloj();
    });
  }

  protected atras(): void {
    const paso = this.store.paso();
    if (paso === 1) this.cerrar.emit();
    else this.ir((paso - 1) as PasoReset);
  }

  protected enviarCorreo(): void {
    if (!this.store.confirmarCorreo()) return this.campoCorreo()?.enfocar();
    this.enviar();
  }

  protected validarCodigo(): void {
    if (!this.store.confirmarCodigo()) return this.campoCodigo()?.enfocar();
    this.cargando(TEXTOS_LOGIN.cargaValidando, () => this.ir(3));
  }

  protected reenviar(): void {
    this.store.reenviar();
    this.enviar();
  }

  protected continuar(): void {
    this.cargando(TEXTOS_LOGIN.cargaGuardando, () => {
      this.detenerReloj();
      this.completado.emit();
    });
  }

  /** El foco al primer campo del paso lo pone cada campo con `autoEnfocar`. */
  private ir(paso: PasoReset): void {
    this.store.irA(paso);
    if (paso !== 2) this.detenerReloj();
  }

  private enviar(): void {
    this.cargando(TEXTOS_LOGIN.cargaEnviando, () => {
      this.ir(2);
      this.iniciarReloj();
    });
  }

  private cargando(mensaje: string, luego: () => void): void {
    this.store.mostrarCarga(mensaje);
    clearTimeout(this.carga);
    this.carga = setTimeout(() => {
      this.store.ocultarCarga();
      luego();
    }, TIEMPOS_LOGIN.carga);
  }

  private iniciarReloj(): void {
    this.store.iniciarReloj();
    this.detenerReloj();
    this.reloj = setInterval(() => {
      if (this.store.tic()) this.detenerReloj();
    }, TIEMPOS_LOGIN.tic);
  }

  private detenerReloj(): void {
    clearInterval(this.reloj);
    this.reloj = undefined;
  }
}
