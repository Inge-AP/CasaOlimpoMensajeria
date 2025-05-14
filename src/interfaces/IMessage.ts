/**
 * Interfaz que define la estructura de un mensaje.
 */
export interface IMessage {
  /**
   * La fecha y hora en que se envió el mensaje.
   */
  sent_on: string;

  /**
   * El ID de la sesión en la que se envió el mensaje.
   */
  sessionId: string;

  /**
   * El número de teléfono del cliente que atendera el maestro.
   */
  phoneNumberCliente: string;

  /**
   * El número de teléfono del Maestro que antendera el cliente.
   */
  phoneNumberMaestro: string;

  /**
   * El nombre de usuario del remitente del mensaje.
   */
  nombreDelCliente: string;

  /**
   * El contenido del mensaje.
   */
  message: string;
}
