import {RED, LIGHT_RED, YELLOW, LIGHT_GREEN, LIGHT_BLUE, LIGHT_CYAN} from './colors'

const LEVELS= {
  error: 1,
  warn: 2,
  info: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

class Logger {
  constructor (level) {
    this.level= LEVELS[level != undefined ? level : 'debug']
  }

  _log(color, lvl, msg) {
    if (this.level>=lvl) {
      console.log(color(msg))
    }
  }

  silly(msg) {
    this._log(LIGHT_CYAN, 6, msg)
  }

  debug(msg) {
    this._log(LIGHT_BLUE, 5, msg)
  }

  verbose(msg) {
    this._log(LIGHT_GREEN, 4, msg)
  }

  info(msg) {
    this._log(YELLOW, 3, msg)
  }

  warn(msg) {
    this._log(LIGHT_RED, 2, msg)
  }

  error(msg) {
    this._log(RED, 1, msg)
  }
}

export default Logger
