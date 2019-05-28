const pgTypes = require('pg-types')

export default {
  INTEGER: pgTypes['integer/int4'],
  FLOAT: pgTypes['double precision / float 8'],
  TEXT: pgTypes['string/varchar'],
  BYTEA: pgTypes.bytea
}