import makeConfig from './defaults/config'
import fmtQuery   from './util/format'
import Logger     from './util/logger'
const { performance } = require('perf_hooks')

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

  async call(query, values, options) {
    const started = performance.now()

    if (options===undefined)
      options= {}


    const action = (t) => {
      return t.oneOrNone(query, values)
    }
  
    const trx = options.transaction!=undefined 
      ? options.transaction 
      : this.transaction
    const prm = trx(action)
  
    let ret= null

    try {
      const res = await prm
      
      if (res!=null) {
        const ks= Object.keys(res)
        ret= res[ks[0]]
        if (ks.length>1) {
          this.log.error(`smorm.call() Returned more than one field. Just ${ks[0]} will be returned. Fields are ${JSON.stringify(ks)}`)
        }
      }
      if (options.log!==false) {
        const elapsed = parseFloat( (performance.now() - started) / 1000.0 ).toFixed(2)
        this.log.debug(fmtQuery(query, values))
        this.log.debug(`Call finished in ${elapsed} seconds`)
      }
    } catch (error) {
      this.log.error(fmtQuery(query, values))
      this.log.error(error.constructor.name)
      this.log.error(error.stack)
    }

    return ret
  }

  async select(query, values, options) {
    const started = performance.now()

    if (options===undefined)
      options= {}

    const action = (t) => {
      return t.any(query, values)
    }
  
    const trx = options.transaction!=undefined 
      ? options.transaction 
      : this.transaction
    const prm = trx(action)
  
    let data= []

    try {
      data = await prm

      if (options.log!==false) {
        const elapsed = parseFloat( (performance.now() - started) / 1000.0 ).toFixed(2)
        this.log.debug(fmtQuery(query, values))
        this.log.debug(`Returned ${data.length} rows in ${elapsed} seconds`)
      }
    } catch (error) {
      this.log.error(fmtQuery(query, values))
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
