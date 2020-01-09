import makeConfig from './defaults/config'
import fmtQuery   from './util/format'
import Logger     from './util/logger'

class Smorm {
  constructor(config, log) {
    this.config = makeConfig(config)
    const pgp   = require('pg-promise')()
    this.db     = pgp(this.config)

    if (log==undefined) {
      this.log= new Logger()
    } else if (typeof log == 'string') {
      this.log= new Logger(log)
    } else {
      this.log = log
    }
  }

  get transaction() {
    return this.db.tx  
  }

  async select(query, values, options) {
    const action = (t) => {
      return t.any(query, values)
    }
  
    const trx = options!=undefined
      ? options.transaction!=undefined ? options.transaction : this.transaction
      : this.transaction
    const prm = trx(action)
  
    let data= []

    try {
      data = await prm
      this.log.debug(fmtQuery(query, values))
      this.log.debug('Returned ' + data.length + ' rows')
    } catch (error) {
      this.log.error(error.constructor.name)
      this.log.error(error.stack)
    }

    return data
  }
  
  async select_one(query, values, options) {
    const data = await this.select(query, values, {transaction: options.transaction})

    const omitWarning = options!=undefined
      ? options.omitWarning===true ? true : false
      : false
  
    if (data.length>1 && !omitWarning) {
      this.log.debug(fmtQuery(query, values))
      this.log.warn('Returned ' + data.length + ' rows, but expected just 1')
    }
  
    if (data.length>0)
      return data[0]
    
    return {}
  }  

}

export default (config, log) => {
  return new Smorm(config, log)
}
