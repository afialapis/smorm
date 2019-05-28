const _END_COLORS = '\u001b[39m'
const _PURPLE       = '\u001b[0;35m'
const _LIGHT_PURPLE = '\u001b[1;35m'
const _RED = '\u001b[0;31m'
const _LIGHT_RED = '\u001b[1;31m'
const _GREEN        = '\u001b[0;32m'
const _LIGHT_GREEN = '\u001b[1;32m'
const _YELLOW = '\u001b[0;33m'
const _BLUE         = '\u001b[0;34m'
const _LIGHT_BLUE = '\u001b[1;34m'
const _CYAN         = '\u001b[0;36m'
const _LIGHT_CYAN = '\u001b[1;36m'
const _WHITE        = '\u001b[1;37m'  
const _GRAY         = '\u001b[0;37m'
const _DARK_GRAY = '\u001b[1;30m'

const _f = (col, s) => {
  return col + s + _END_COLORS
}

const PURPLE      = (s) => _f(_PURPLE, s)
const LIGHT_PURPLE= (s) => _f(_LIGHT_PURPLE, s)
const RED         = (s) => _f(_RED, s)
const LIGHT_RED   = (s) => _f(_LIGHT_RED, s)
const GREEN       = (s) => _f(_GREEN, s)
const LIGHT_GREEN = (s) => _f(_LIGHT_GREEN, s)
const YELLOW      = (s) => _f(_YELLOW, s)
const BLUE        = (s) => _f(_BLUE, s)
const LIGHT_BLUE  = (s) => _f(_LIGHT_BLUE, s)
const CYAN        = (s) => _f(_CYAN, s)
const LIGHT_CYAN  = (s) => _f(_LIGHT_CYAN, s)
const WHITE       = (s) => _f(_WHITE, s)
const GRAY        = (s) => _f(_GRAY, s)
const DARK_GRAY   = (s) => _f(_DARK_GRAY, s)

export { PURPLE, LIGHT_PURPLE, RED, LIGHT_RED, GREEN, LIGHT_GREEN, YELLOW, BLUE, LIGHT_BLUE, CYAN, LIGHT_CYAN, WHITE, GRAY, DARK_GRAY }
