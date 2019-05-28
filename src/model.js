/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "opt" }]*/

import clone from './util/clone'
import fmtQuery from './util/format'

class _BaseModel {
  constructor(db, tablename, definition) {
    this.db         = db
    this.tablename  = tablename
    this.definition = Object.assign(clone(db.defaultFields), definition)
  }

  get fields() {
    return Object.keys(this.definition)
  }

  _objToTuple(obj) {
    let fields = [], values = []
    for (const fld in obj) {
      if (this.fields.indexOf(fld) >= 0) {
        fields.push(fld)
        values.push(obj[fld])
      }
    }
    return [fields, values]
  }

  async beforeRead(filter, options) {
    return Promise.resolve([
      filter, options, true
    ])
  }

  async afterRead(data, options) {
    return Promise.resolve([
      data
    ])
  }

  async read(filt, opts) {

    if (opts===undefined)
      opts= {}

    const [filter, options, goon] = await this.beforeRead(filt, opts)

    if (! goon)
      return []
    

    const sselect = options.fields != undefined ? options.fields.join(',') : '*'

    const [wfields, wvalues] = this._objToTuple(filter)
    
    let swhere= ''
    if (wfields.length > 0)
      swhere= ' WHERE ' + wfields.map((f, i) => {
        if (typeof wvalues[i] == 'object' && wvalues[i].constructor.name=='Array') {
          return f + ' IN ($' + (i + 1) + ':csv)'
        }
        else {
          return f + ' = $' + (i + 1)
        }
      }).join(' AND ')
    
    let query = `SELECT ${sselect} FROM ${this.tablename} ${swhere}`

    if (options.sortby) {
      let name= '', dir= 1
      if (typeof options.sortby == 'object') {
        name= options.sortby[0]
        dir=options.sortby[1]
      } else {
        name= options.sortby
      }
      query+= ` SORT BY ${name} ${!dir ? 'DESC' : 'ASC'}`
    }

    if (options.limit && options.offset) {
      query += ` LIMIT ${options.limit} OFFSET ${options.offset}`
    }

    const action = (t) => {
      return t.any(query, wvalues)
    }

    const prm = options.transaction != undefined ? options.transaction(action) : this.db.transaction(action)
    
    let data
    try {
      data = await prm
    } catch (error) {
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)
      return []
    }

    data= await this.afterRead(data, options)

    this.db.log.debug(fmtQuery(query, wvalues))
    this.db.log.debug('Returned ' + data.length + ' rows')    
  }



  async find(id, options) {
    const data= await this.read({id: id}, options)
    try {
      return data[0]
    } catch(error) {
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)      
      return {}
    }
  }

  async beforeInsert(params, options) {
    return Promise.resolve([
      params, options, true
    ])
  }

  async afterInsert(id, options) {
    return Promise.resolve([
      id
    ])
  }


  async insert(prms, opts) {

    if (opts===undefined)
      opts= {}

    let [params, options, goon] = await this.beforeInsert(prms, opts)

    if (! goon)
      return []

    const ituple = this._objToTuple(params)
    const ifields = ituple[0]
    const ivalues = ituple[1]

    const sfields = ifields.join(',')
    const sinsert = ifields.map((f, i) => '$' + (i + 1)).join(',')
    
    const query = `INSERT INTO ${this.tablename} (${sfields}) VALUES (${sinsert}) RETURNING id`

    const action = (t) => {
      return t.one(query, ivalues)
    }

    const prm = options.transaction != undefined ? options.transaction(action) : this.db.transaction(action)

    let id= undefined
    try {
      const data = await prm
      id= await this.afterInsert(data.id, options)
      this.db.log.debug(fmtQuery(query, ivalues))
      this.db.log.debug('Created with Id: '+ id)
    } catch (error) {
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)
    }

    return id
  }


  async beforeUpdate(params, filter, options) {
    return Promise.resolve([
      params, filter, options, true
    ])
  }

  async afterUpdate(rows, options) {
    return Promise.resolve([
      rows
    ])
  }


  async update(prms, filt, opts) {

    if (opts===undefined)
      opts= {}

    let [params, filter, options, goon] = await this.beforeUpdate(prms, filt, opts)

    if (! goon)
      return []

    const utuple = this._objToTuple(params)
    const ufields = utuple[0]
    const uvalues = utuple[1]

    if (ufields.length == 0) {
      this.db.log.error('Nothing to update')
      return 0
    }

    const sfields = 'SET ' + ufields.map((f, i) => f + ' = $' + (i + 1)).join(',')


    const wtuple = this._objToTuple(filter)
    const wfields = wtuple[0]
    const wvalues = wtuple[1]

    let swhere = ''
    if (wfields.length > 0)
      swhere = ' WHERE ' + wfields.map((f, i) => f + ' = $' + (i + 1 + ufields.length)).join(' AND ')    

    const allvalues= uvalues.concat(wvalues)
    const query = `WITH rows as (UPDATE ${this.tablename} ${sfields} ${swhere} RETURNING 1) SELECT count(*) FROM rows`

    const action = (t) => {
      return t.one(query, allvalues)
    }

    const prm = options.transaction != undefined ? options.transaction(action) : this.db.transaction(action)

    let count= 0
    try {
      const data = await prm
      count= this.afterUpdate(data.count, options)
      this.db.log.debug(fmtQuery(query, allvalues))
      this.db.log.debug('Updated ' + count +' records ')
    } catch (error) {
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)
    }

    return count
  }  


  async beforeDelete(filter, options) {
    return Promise.resolve([
      filter, options, true
    ])
  }

  async afterDelete(rows, options) {
    return Promise.resolve([
      rows
    ])
  }


  async delete(filt, opts) {

    if (opts===undefined)
      opts= {}

    let [filter, options, goon] = await this.beforeDelete(filt, opts)

    if (! goon)
      return []    

    const wtuple = this._objToTuple(filter)
    const wfields = wtuple[0]
    const wvalues = wtuple[1]


    let swhere = ''
    if (wfields.length > 0)
      swhere = ' WHERE ' + wfields.map((f, i) => f + ' = $' + (i + 1)).join(' AND ')


    const query = `WITH rows as (DELETE FROM ${this.tablename} ${swhere} RETURNING 1) SELECT count(*) FROM rows`

    const action = (t) => {
      return t.one(query, wvalues)
    }

    const prm = options.transaction != undefined ? options.transaction(action) : this.db.transaction(action)

    let count= 0
    try {
      const data = await prm
      count= this.afterDelete(data.count, options)
      this.db.log.debug(fmtQuery(query, wvalues))
      this.db.log.debug('Deleted ' + count + ' records ')
    } catch (error) {
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)
    }    

    return count
  }  
}


function makeModel(db, tablename, definition)  {
  return new _BaseModel(db, tablename, definition)
}

export default makeModel