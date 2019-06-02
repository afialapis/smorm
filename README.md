# Smorm

![smorm](https://smorm.afialapis.com/smorm.png)

Smorm is a small ORM, for those out there who still feel good typing some raw SQL


What it does:

  - Basic and typical Models usage
  - CRUD operations out of the box
  - Async and transactions support

What it does not do:

  - Query builder: apart from basic CRUD stuff, you'll use raw SQL for any other query
  - Table relations: at least by now, it does not provide the typical methods FatherModel.getChildrens()

You can read about our motivations **HERE**

Currently, it only supports PostgreSQL through [pg-promise](https://github.com/vitaly-t/pg-promise). 
Hopefully, in the near future, we'll add support for MySql, MsSql, Sqlite, ... who knows.

## Install

`npm install smorm --save-dev`

## Get started

```javascript
// Using Node.js `require()`
const smorm = require('smorm');

// Using ES6 imports
import smorm from 'smorm';
```

## Documentation

At [smorm.afialapis.com](http://smorm.afialapis.com/) you can find detailed docs.