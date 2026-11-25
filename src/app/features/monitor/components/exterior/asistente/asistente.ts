import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { ACCIONES_RAPIDAS } from '@features/monitor/data/exterior-asistente.mock';
import { AccionRapida, MensajeAsistente } from '@features/monitor/interfaces/exterior';

/**
 * Asistente del Monitor (`assistant`): bienvenida con acciones rápidas, conversación con «Escribiendo» y campo de
 * texto (Enter envía; Mayús+Enter hace salto de línea). La conversación la lleva la página: este componente solo
 * pinta `mensajes` y avisa `enviar`. La «x» para cerrar es del laboratorio (ver la página).
 */
@Component({
  selector: 'nc-mon-asistente',
  imports: [Icono],
  templateUrl: './asistente.html',
  styleUrl: './asistente.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Asistente {
  readonly mensajes = input<readonly MensajeAsistente[]>([]);
  readonly escribiendo = input(false);

  readonly enviar = output<string>();
  readonly cerrar = output<void>();

  protected readonly acciones = ACCIONES_RAPIDAS;
  protected readonly texto = signal('');

  private readonly contenido = viewChild<ElementRef<HTMLElement>>('contenido');
  private readonly campo = viewChild<ElementRef<HTMLTextAreaElement>>('campo');

  constructor() {
    // Como producción: baja al último mensaje y, con la respuesta, devuelve el foco al campo.
    afterRenderEffect(() => {
      const hayMensajes = this.mensajes().length > 0;
      const escribiendo = this.escribiendo();
      const contenido = this.contenido()?.nativeElement;
      if (contenido) {
        contenido.scrollTop = contenido.scrollHeight;
      }
      if (hayMensajes && !escribiendo) {
        this.campo()?.nativeElement.focus();
      }
    });
  }

  protected accionRapida(accion: AccionRapida): void {
    this.enviar.emit(accion.texto);
  }

  protected alEnter(evento: Event): void {
    if ((evento as KeyboardEvent).shiftKey) {
      return;
    }
    evento.preventDefault();
    this.enviarTexto();
  }

  protected enviarTexto(): void {
    const texto = this.texto().trim();
    if (!texto || this.escribiendo()) {
      return;
    }
    this.enviar.emit(texto);
    this.texto.set('');
  }
}
