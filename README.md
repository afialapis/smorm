# Minorm

![minorm](https://minorm.afialapis.com/minorm.png)

Minorm is a minimalist ORM, for those out there who still feel good typing some raw SQL

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

`npm install minorm --save-dev`

## Get started

```javascript
// Using Node.js `require()`
const minorm = require('minorm');

// Using ES6 imports
import minorm from 'minorm';
```

## Documentation

At [minorm.afialapis.com](http://minorm.afialapis.com/) you can find detailed docs.