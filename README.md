

![Smorm logo](https://smorm.afialapis.com/assets/images/logo/smorm_name.png)

[![NPM Version](https://badge.fury.io/js/smorm.svg)](https://www.npmjs.com/package/smorm)
[![Dependency Status](https://david-dm.org/afialapis/smorm.svg)](https://david-dm.org/afialapis/smorm)
[![NPM Downloads](https://img.shields.io/npm/dm/smorm.svg?style=flat)](https://www.npmjs.com/package/smorm)

# Table of Contents

1. [Intro](#intro)
2. [Install](#install)
3. [Get started](#get-started)
4. [Simple querying](#simple-querying)
5. [Using models](#using-models)
6. [ToDo](#todo)


# Intro

[Smorm](http://smorm.afialapis.com/) is a small, minimalist ORM, for those out there who still feel good typing some raw SQL.

What it does:

  - Basic ORM Models usage
  - CRUD operations out of the box
  - Async/await operations
  - Transactions support

What it does not do:

  - Query builder: 
    - apart from the aforementioned CRUD stuff, you'll use raw SQL for any other query
  - Table relations: 
    - it does not provide the typical methods `FatherModel.getChildrens()`

[comment]: # (You can read about our motivations **HERE**)

Currently, it only supports PostgreSQL through [pg-promise](https://github.com/vitaly-t/pg-promise). 
We may add support for other databases (MySql, MsSql, Sqlite, ...) in the future... or may not.

# Install

```
npm install smorm --save-dev
```

# Get started

```javascript
// Using Node.js `require()`
const Smorm = require('smorm');
// Using ES6 imports
import Smorm from 'smorm';
```

A simple way to work with Smorm: create an unique 
db connection to be used widely trough your app.

```javascript
const config= {
  host:     'localhost',
  port:      5432,
  database: 'smorm',
  user:     'postgres',
  password: 'postgres'
}

const db= Smorm(config, 'warn')

export default db
```

The second parameter on the ```Smorm``` call indicates the logging level.

Possible values are:

  - `undefined` or `'none'` => will disable any Smorm logging
  - `'error'`, `'warn'` or `'debug'`
  - an object implementing the methods `error()`, `warn()` and `debug()`

# Simple querying

Import your db connection:

```javascript
import db from './my_db'
```

To select several records:

```javascript
const query = 'SELECT name, job FROM employee WHERE employer_id = $1'
const result= db.select(qry, [1])
```

To select one record:

```javascript
const query = 'SELECT name, job FROM employee WHERE id = $1'
const result= db.select_one(qry, [1])
```

# Using models

## Model definition

```javascript
import {Model, datatypes} from 'smorm'
import db from './db'
```

First create a Model's definition. 

It's basically a JSON listing all the fields of the table that your Model will represent.

You have to indicate, for each field:

  - type: one of `datatypes`
  - key: if the field is table's Primary Key
  - nullable: if the field allows NULL values

There is no way to specify table relations, cause Smorm does nothing about it. Yet. 
This may change in future versions: Smorm wants to make sense out of its 'r'!

```javascript
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
```

## Model instantiation

Next thing is just instantiate the model:

```javascript
const TestModel = new Model(db, 'smorm_test', MODEL_DEFINITION)
export default TestModel
```

As for with db connection, you may work with an unique instance per model.

In Smorm, a Model instance always refers to the database table; it never refers to a single record.

In other words: unlike other ORMs, you will not do `const model= Model.create(); model.fieldA= 'value'; model.save()`.
In Smorm you will do `Model.insert({data})` or `Model.update({data}, {filter})`.


## Insert

Let's test our brand new `TestModel`. Let's `.insert()` some data:

```javascript
const testData= [
  {name: 'Peter', description: 'A simple man', counter: 91},
  {name: 'Harry', description: 'A dirty man' , counter: 99},
  {name: 'James', description: 'A golden man', counter: 99},
  {name: 'Jonny', description: 'A rocker man', counter: 46},
]

let prms = testData.map(async (rec) => {
  return await TestModel.insert(rec)
})
await Promise.all(prms)
```

`.insert()` parameters are:
  
  - `data`: an object with "what to insert". Fields that do not exist on Model definition will be discarded.
  - `options`: an object that may contain following fields:
    - `transaction`: an Smorm transaction object

It returns an `int` with the `.id` of the newly created record.

## Update

Let's also `.update()` some record:

```javascript
const count= await TestModel.update({description: 'A not so simple man'}, {name: 'Peter'})
// count: 1
```

`.update()` parameters are:
  
  - `data`: an object with "what to update". Fields that do not exist on Model definition will be discarded.
  - `filter`: an object with "which recors to update". Fields that do not exist on Model definition will be discarded.
  - `options`: an object that may contain following fields:
    - `transaction`: an Smorm transaction object

It returns an `int` with the number of affected records by the update.

## Delete

Let's also `.delete()` some record:

```javascript
const count= await TestModel.delete( {name: 'Jonny'})
// count: 1
```

`.delete()` parameters are:
  
  - `filter`: an object with "which recors to delete". Fields that do not exist on Model definition will be discarded.
  - `options`: an object that may contain following fields:
    - `transaction`: an Smorm transaction object

It returns an `int` with the number of deleted records.

## Read

Probably the most wanted method.

```javascript
const records= await TestModel.read( counter: 99 )
// records:
// [ {id: 2, name: 'Harry', description: 'A dirty man' , counter: 99},
//   {id: 3, name: 'James', description: 'A golden man', counter: 99}]
```

`.read()` parameters are:
  
  - `filter`: an object with "which recors to read". Fields that do not exist on Model definition will be discarded.
  - `options`: an object that may contain following fields:
    - `fields`: a subset of table's field names to include on the result output
    - `sortby`: indicates wat field to sort by the read. It may be an `string` with the field's name 
                (sort will be `ASC`), or a two elements Array like `[field_name, ASC|DESC]`
    - `limit` and `offset`: to make paginated reads
    - `transaction`: an Smorm transaction object

It returns an Array of objects, empty if no record was found with the specified filter.

## Find

For one-records by `.id` reads in the database:

```javascript
const record= await TestModel.find( id: 1 )
// record:
// {id: 1, name: 'Peter', description: 'A not so simple man', counter: 91}
```
`.find()` parameters are:
  
  - `id`: an `int` with the `.id` to look for
    - `transaction`: an Smorm transaction object

It returns an object with the desired record, empty if none was found.

# Todo

- Transaction creation out of the box
- Query launchers: db.call
