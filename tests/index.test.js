import Smorm from '../src'
import {INTEGER, TEXT} from '../src/datatypes'
var assert = require('assert')

const MODEL_DEFINITION= {
  name: {
    type: TEXT,
    nullable: false,
  },
  description: {
    type: TEXT,
    nullable: true,
  },
  counter: {
    type: INTEGER,
    nullable: true,
  }    
}

const MODEL_RECORDS= [
  {name: 'Peter', description: 'A simple man', counter: 91},
  {name: 'Harry', description: 'A dirty man' , counter: 99},
  {name: 'James', description: 'A golden man', counter: 99},
  {name: 'Jonny', description: 'A rocker man', counter: 46},
]


let db, Model

describe('Smorm', function() {
  describe('database', function() {
    it('should create Smorm database', function() {
      db= Smorm()
    })
  }),
  describe('Model', function() {
    it('should create a Smorm model', function() {
      Model = db.model('smorm_test', MODEL_DEFINITION)
    })
  }),
  describe('Insert', function() {
    it('should insert several records', async function() {
      let prm1 = MODEL_RECORDS.map(async (rec) => {
        return await Model.insert(rec) //.catch((e) => {})
      })
      await Promise.all(prm1)
    })
  }),
  describe('Update', function() {
    it('should update one record', async function() {
      const count= await Model.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.equal(count, 1)
    })
  }),
  describe('Update', function() {
    it('should update several records', async function() {
      const count= await Model.update({name: 'Frederic'}, {counter: 99})
      assert.equal(count, 2)
    })
  }),
  describe('Delete', function() {
    it('should delete one record', async function() {
      const count= await Model.delete( {name: 'Jonny'})
      assert.equal(count, 1)
    })
  }),
  describe('Delete', function() {
    it('should delete other records', async function() {
      const count= await Model.delete( {})
      assert.equal(count, 3)
    })
  }),
  describe('Done', function() {
    it('should finnish now', async function() {
      return true
    })
  })
})



