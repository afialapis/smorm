import {Model, datatypes} from '../src/index'
import db from './db'
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
  }    
}

const MODEL_RECORDS= [
  {name: 'Peter', description: 'A simple man', counter: 91},
  {name: 'Harry', description: 'A dirty man' , counter: 99},
  {name: 'James', description: 'A golden man', counter: 99},
  {name: 'Jonny', description: 'A rocker man', counter: 46},
]


let TestModel


describe('Smorm', function() {
  describe('TestModel', function() {
    it('should create a Smorm model', function() {
      TestModel = new Model(db, 'smorm_test', MODEL_DEFINITION)
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
  describe('Count', function() {
    it('should count 3 records', async function() {
      const count= await TestModel.count( {})
      assert.equal(count, 3)
    })
  }),
  describe('Count', function() {
    it('should count 2 records with name Frederic', async function() {
      const count= await TestModel.count( {name: 'Frederic'})
      assert.equal(count, 2)
    })
  }),
  describe('Count', function() {
    it('should count 2 distinct names, Frederic and Peter', async function() {
      const count= await TestModel.count( {}, {distinct: 'name'})
      assert.equal(count, 2)
    })
  }),
  describe('Distinct', function() {
    it('should return distinct names, Frederic and Peter', async function() {
      const names= await TestModel.distinct( 'name', {})
      assert.equal(names.length, 2)
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



