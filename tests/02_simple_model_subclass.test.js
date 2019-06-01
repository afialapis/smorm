import {Smorm, Model, datatypes} from '../src/index'
var assert = require('assert')

const MODEL_DEFINITION= {
  id: {
    type: datatypes.INTEGER,
    key: true,
    nullable: false
  },
  name: {
    type: datatypes.TEXT,
    nullable: false,
  },
  description: {
    type: datatypes.TEXT,
    nullable: true,
  },
  counter: {
    type: datatypes.INTEGER,
    nullable: true,
  },
  created_at: {
    type: datatypes.INTEGER,
    nullable: true
  },
  last_updated_at: {
    type: datatypes.INTEGER,
    nullable: true
  }
}

const MODEL_RECORDS= [
  {name: 'Peter', description: 'A simple man', counter: 91},
  {name: 'Harry', description: 'A dirty man' , counter: 99},
  {name: 'James', description: 'A golden man', counter: 99},
  {name: 'Jonny', description: 'A rocker man', counter: 46},
]

class TestModelClass extends Model {
  
  async beforeInsert(params, options) {
    const now= new Date() / 1000
    params.created_at= now
    return Promise.resolve([
      params, options, true
    ])
  }  

  async beforeUpdate(params, filter, options) {
    const now= new Date() / 1000
    params.last_updated_at= now
    return Promise.resolve([
      params, filter, options, true
    ])
  }  
}


let db, TestModel


describe('Smorm', function() {
  describe('database', function() {
    it('should create Smorm database', function() {
      db= Smorm()
    })
  }),
  describe('TestModel', function() {
    it('should create a Smorm model', function() {
      TestModel = new TestModelClass(db, 'smorm_test', MODEL_DEFINITION)
    })
  }),
  describe('Insert', function() {
    it('should insert several records', async function() {
      let prm1 = MODEL_RECORDS.map(async (rec) => {
        return await TestModel.insert(rec) //.catch((e) => {})
      })
      await Promise.all(prm1)
    })
  }),
  describe('Update', function() {
    it('should update one record', async function() {
      const count= await TestModel.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.equal(count, 1)
    })
  }),
  describe('Update', function() {
    it('should update several records', async function() {
      const count= await TestModel.update({name: 'Frederic'}, {counter: 99})
      assert.equal(count, 2)
    })
  }),
  describe('Delete', function() {
    it('should delete one record', async function() {
      const count= await TestModel.delete( {name: 'Jonny'})
      assert.equal(count, 1)
    })
  }),
  describe('Delete', function() {
    it('should delete other records', async function() {
      const count= await TestModel.delete( {})
      assert.equal(count, 3)
    })
  }),
  describe('Done', function() {
    it('should finnish now', async function() {
      return true
    })
  })
})



