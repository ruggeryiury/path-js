/**
 * Generic `PathJS` module error.
 * - - - -
 */
export class PathJSError extends Error {
  /**
   * @param {string} message `OPTIONAL` A message to be displayed on thrown error.
   * If `undefined`, the message `"An unknown error occured"` will be displayed.
   */
  constructor(message = 'An unknown error occured') {
    super(message)
    this.name = 'PathJSError'
    Error.captureStackTrace(this, PathJSError)
    Object.setPrototypeOf(this, PathJSError.prototype)
  }
}
