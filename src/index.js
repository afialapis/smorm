import makeConfig from './defaults/config'
import makeFields from './defaults/fields'
import makeModel  from './model'
import fmtQuery   from './util/format'
import logger     from './util/logger'

class Smorm {
  constructor(config, defaultFields, log) {
    this.config = makeConfig(config)
    this.defaultFields= makeFields(defaultFields)
    this.log    = log!==undefined ? log : logger
    const pgp   = require('pg-promise')()
    this.db     = pgp(this.config)
  }

  model(tablename, definition) {
    return makeModel(this, tablename, definition)
  }

  get transaction() {
    return this.db.tx  
  }

  async select(query, values, transaction) {
    const action = (t) => {
      return t.any(query, values)
    }
  
    const prm = transaction != undefined ? transaction(action) : this.transaction(action)
  
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
  
  async select_one(query, values, transaction, omitWarning= false) {
    const data = await this.select(query, values, transaction)
  
    if (data.length>1 && !omitWarning) {
      this.log.debug(fmtQuery(query, values))
      this.log.warn('Returned ' + data.length + ' rows, but expected just 1')
    }
  
    if (data.length>0)
      return data[0]
    
    return {}
  }  

}

export default (config, defaultFields, log) => {
  return new Smorm(config, defaultFields, log)
}
