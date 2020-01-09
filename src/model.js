/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "opt" }]*/
import fmtQuery from './util/format'

class Model {
  constructor(db, tablename, definitionOrFilepath) {
    this.db         = db
    this.tablename  = tablename
    if (typeof definitionOrFilepath != 'object') {
      const fs   = require('fs')
      this.definition = JSON.parse(fs.readFileSync(definitionOrFilepath, 'utf8'))
    } else {
      this.definition = definitionOrFilepath
    } 
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

  async afterRead(data, filter, options) {
    return Promise.resolve(
      data
    )
  }

  ensureDefs(data) {
    data.map((record) => {
      this.fields.map((fld) => {
        if (record[fld]===null) {
          const fdef= this.definition[fld]
          if (fdef.hasOwnProperty('default')) {
            record[fld]= fdef.default
          }
        }
      })
    })
  }

  prepareQuery(filter, options) {

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

    return [query, wvalues]
  }

  async read(filt, opts) {

    if (opts===undefined)
      opts= {}

    const [filter, options, goon] = await this.beforeRead(filt, opts)

    if (! goon)
      return []

    const [query, wvalues] = this.prepareQuery(filter, options)

    const action = (t) => {
      return t.any(query, wvalues)
    }

    const prm = options.transaction != undefined ? options.transaction(action) : this.db.transaction(action)
    
    let data
    try {
      data = await prm
    } catch (error) {
      this.db.log.error(`${this.tablename} ERROR:`)
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)
      data= []
    }

    this.ensureDefs(data)

    data= await this.afterRead(data, filter, options)
    
    this.db.log.debug(`${this.tablename} read() SQL:`)
    this.db.log.debug(fmtQuery(query, wvalues))
    this.db.log.debug(`${this.tablename} - Returned ${data.length} rows`)

    return data
  }

  async keyList(options) {    
    let res= {}
    const data = await this.read({}, {fields: ['id', 'name'], transaction: options ? options.transaction : undefined})
    data.map((d) => {res[d.id]= d.name})
    return res
  }


  async find(id, options) {
    if (isNaN(id) || id <= 0) {    
      const msg = this.tablename + ': cannot find, invalid Id <' + id + '>'
      this.db.log.error(msg)
      throw new Error(msg)
    }

    const data= await this.read({id: id}, options)
    
    let odata= {}
    if (Array.isArray(data)) {
      this.ensureDefs(data)
      odata= data[0]
    } else {
      this.db.log.warn(`${this.tablename}: Id ${id} does not exist`)
    }

    return odata
  }

  prepareObj(obj) {
    let out = {}
    
    Object.keys(obj)
      .filter((k) => this.fields.indexOf(k) >=0)
      .map((k) => {
        out[k] = obj[k]
      })

    return out
  }

  async beforeInsert(params, options) {
    return Promise.resolve([
      params, options, true
    ])
  }

  async afterInsert(id, params, options) {
    return Promise.resolve(
      id
    )
  }


  async insert(data, opts) {
    data= this.prepareObj(data)

    if (opts===undefined)
      opts= {}
    

    let [params, options, goon] = await this.beforeInsert(data, opts)

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
      const ndata = await prm
      id= await this.afterInsert(ndata.id, params, options)
      this.db.log.debug(`${this.tablename} insert() SQL:`)
      this.db.log.debug(fmtQuery(query, ivalues))
      this.db.log.debug('Created with Id: '+ id)

      if (id == null) {
        const msg = this.tablename + ': cannot save ' + JSON.stringify(data)
        this.db.log.error(msg)
      }      
    } catch (error) {
      this.db.log.error(`${this.tablename} ERROR:`)
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

  async afterUpdate(rows, params, filter, options) {
    return Promise.resolve(
      rows
    )
  }


  async update(data, filt, opts) {
    data= this.prepareObj(data)
    delete data.id

    if (opts===undefined)
      opts= {}

    let [params, filter, options, goon] = await this.beforeUpdate(data, filt, opts)

    if (! goon)
      return []

    const utuple = this._objToTuple(params)
    const ufields = utuple[0]
    const uvalues = utuple[1]

    if (ufields.length == 0) {
      this.db.log.error(`${this.tablename} ERROR: Nothing to update`)
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
      const ndata = await prm
      count= await this.afterUpdate(ndata.count, params, filter, options)
      this.db.log.debug(`${this.tablename} update() SQL:`)
      this.db.log.debug(fmtQuery(query, allvalues))
      this.db.log.debug('Updated ' + count +' records ')

      if (count == 0) {
        const msg = this.tablename + ': no record updated with filter ' + JSON.stringify(filt) + ' -- ' + JSON.stringify(data)
        this.db.log.warn(msg)
      }      
    } catch (error) {
      this.db.log.error(`${this.tablename} ERROR:`)
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

  async afterDelete(rows, filter, options) {
    return Promise.resolve(
      rows
    )
  }


  async delete(filt, opts) {

    if (opts===undefined)
      opts= {}

    let [filter, options, goon] = await this.beforeDelete(filt, opts)

    if (! goon) {
      const msg = this.tablename + ': Cannot delete for filter ' + JSON.stringify(filt)
      this.db.log.warn(msg)
      return 0
    }  

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
      count= await this.afterDelete(data.count, filter, options)
      this.db.log.debug(`${this.tablename} delete() SQL:`)
      this.db.log.debug(fmtQuery(query, wvalues))
      this.db.log.debug('Deleted ' + count + ' records ')
    } catch (error) {
      this.db.log.error(`${this.tablename} ERROR:`)
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)
    }    

    return count
  }  
}

export default Model