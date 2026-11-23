import { computed, Injectable, signal } from '@angular/core';
import { TEXTOS_LOGIN, TIEMPOS_LOGIN } from '../constants/textos';
import {
  errorCodigo,
  errorCorreoReset,
  evaluarClave,
  formatearReloj,
  limpiarCodigo,
} from '../utils/validaciones';

export type PasoReset = 1 | 2 | 3;
export const TOTAL_PASOS = 3;

/**
 * Estado del flujo «Restablecer contraseña»: correo → código con vencimiento → nueva contraseña.
 * Cero I/O: los tiempos (carga simulada y reloj) los maneja el componente.
 * Se provee en el componente del flujo, así cada apertura arranca limpia.
 */
@Injectable()
export class ResetPasswordStore {
  private readonly _paso = signal<PasoReset>(1);
  private readonly _correo = signal('');
  private readonly _errorCorreo = signal<string | null>(null);
  private readonly _codigo = signal('');
  private readonly _errorCodigo = signal<string | null>(null);
  private readonly _clave = signal('');
  private readonly _claveRepetida = signal('');
  private readonly _segundos = signal<number>(TIEMPOS_LOGIN.relojSegundos);
  private readonly _expirado = signal(false);
  private readonly _cargando = signal<string | null>(null);

  readonly paso = this._paso.asReadonly();
  readonly correo = this._correo.asReadonly();
  readonly errorCorreo = this._errorCorreo.asReadonly();
  readonly codigo = this._codigo.asReadonly();
  readonly errorCodigo = this._errorCodigo.asReadonly();
  readonly clave = this._clave.asReadonly();
  readonly claveRepetida = this._claveRepetida.asReadonly();
  readonly expirado = this._expirado.asReadonly();
  /** Mensaje de la pantalla de carga; `null` = oculta. */
  readonly cargando = this._cargando.asReadonly();

  readonly textoPaso = computed(() => `${this._paso()} de ${TOTAL_PASOS}`);
  readonly evaluacion = computed(() => evaluarClave(this._clave(), this._claveRepetida()));
  readonly errorClave = computed(() =>
    this.evaluacion().noPermitidos ? TEXTOS_LOGIN.caracterNoPermitido : null,
  );
  readonly prefijoReloj = computed(() => (this._expirado() ? TEXTOS_LOGIN.expiro : TEXTOS_LOGIN.expiraEn));
  readonly textoReloj = computed(() => (this._expirado() ? '' : formatearReloj(this._segundos())));

  irA(paso: PasoReset): void {
    this._paso.set(paso);
  }

  escribirCorreo(valor: string): void {
    this._correo.set(valor);
    this._errorCorreo.set(null);
  }

  /** Valida el correo del paso 1; devuelve si puede continuar. */
  confirmarCorreo(): boolean {
    const error = errorCorreoReset(this._correo());
    this._errorCorreo.set(error);
    return error === null;
  }

  /** Guarda el código ya limpio (solo dígitos, máx. 6) y lo devuelve para reflejarlo en el campo. */
  escribirCodigo(valor: string): string {
    const limpio = limpiarCodigo(valor);
    this._codigo.set(limpio);
    this._errorCodigo.set(null);
    return limpio;
  }

  confirmarCodigo(): boolean {
    const error = errorCodigo(this._codigo());
    this._errorCodigo.set(error);
    return error === null;
  }

  /** «Reenviar código»: borra el código y vuelve al texto de vencimiento. */
  reenviar(): void {
    this._codigo.set('');
    this._expirado.set(false);
  }

  escribirClave(valor: string): void {
    this._clave.set(valor);
  }

  escribirClaveRepetida(valor: string): void {
    this._claveRepetida.set(valor);
  }

  iniciarReloj(): void {
    this._segundos.set(TIEMPOS_LOGIN.relojSegundos);
    this._expirado.set(false);
  }

  /** Descuenta un segundo; devuelve `true` cuando el código expira. */
  tic(): boolean {
    const t = this._segundos() - 1;
    this._segundos.set(t);
    if (t <= 0) this._expirado.set(true);
    return t <= 0;
  }

  mostrarCarga(mensaje: string): void {
    this._cargando.set(mensaje);
  }

  ocultarCarga(): void {
    this._cargando.set(null);
  }
}
