import pty from 'ptyw.js'
import EventEmitter from 'events'

class TingProcess extends EventEmitter {
  /**
   * Starts a process in a pseudo-terminal using the arguments provided.
   *
   * Encapsulates away tbtool, pty and any related platform peculiarities.
   *
   * Events:
   *   'data' (data)
   *      The process just outputted 'data'
   *   'exit' (code, signal)
   *      The process just ended. On *nix, 'code' indicates the return code of the process,
   *      and 'signal' is non-zero if the process exited as a result of a signal. On Windows,
   *      'code' and 'signal' are both null.
   */

  constructor (args, options = {}) {
    super()

    this.hasExited = false

    const {extraEnv = {}} = options
    const env = Object.assign({}, process.env, extraEnv)

    const program = args[0]

    if (process.platform !== 'win32') {
      // pty.js on *nix doesn't want the program name as the first argument
      args.shift()
    }

    this.pty = pty.spawn(program, args, {
      name: 'xterm-256color',
      cols: 80,
      row: 24,
      env: env
    })

    this.pty.on('data', (data) => { this.emit('data', data) })
    this.pty.on('exit', (code, signal) => { this._didExit(code, signal) })
  }

  terminate () {
    const isWindows = (process.platform === 'win32')

    if (isWindows) {
      // Send Ctrl-C on Windows
      this.pty.write('\x03')
    } else {
      this.pty.kill('SIGKILL')
    }

    setTimeout(() => {
      if (!this.hasExited) {
        if (isWindows) {
          this.pty.kill()
        } else {
          this.pty.kill('SIGKILL')
        }
      }
    }, 1000)
  }

  resize (cols, rows) {
    this.pty.resize(cols, rows)
  }

  write (data) {
    this.pty.write(data)
  }

  _didExit (code, signal) {
    this.hasExited = true
    this.emit('exit', code, signal)
  }
}

export {TingProcess}
